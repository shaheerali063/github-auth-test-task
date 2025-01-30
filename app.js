const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const cors = require("cors");
const githubRoutes = require('./routes/githubRoutes');
const routes = require("./routes/index");
const User = require('./models/User');
const { encrypt } = require('./helpers/encryption');


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Initialize Passport
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_REDIRECT_URI,
},
async (accessToken, refreshToken, profile, done) => {
  console.log('GitHub Profile:', profile);
  try {
    const encryptedToken = encrypt(accessToken);

    const user = await User.findOneAndUpdate(
      { githubId: profile.id },
      {
        githubId: profile.id,
        username: profile.username,
        avatarUrl: profile.photos[0]?.value || '',
        accessToken: encryptedToken,
        lastSynced: new Date(),
      },
      { upsert: true, new: true }
    );
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// Session handling
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 1-day persistence
}));


app.use(passport.initialize());
app.use(passport.session());

// Import Routes
app.use(routes);
app.use(githubRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
