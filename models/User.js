const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  accessToken: { type: String, required: true },
  lastSynced: { type: Date, required: true },
});

// Hash the accessToken before saving it to MongoDB
userSchema.pre('save', async function (next) {
  if (this.isModified('accessToken')) {
    // Hash the token
    this.accessToken = await bcrypt.hash(this.accessToken, 10);
  }
  next();
});

// Compare provided token with the hashed one
userSchema.methods.compareAccessToken = async function (token) {
  return bcrypt.compare(token, this.accessToken);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
