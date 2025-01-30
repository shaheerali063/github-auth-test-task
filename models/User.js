const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  accessToken: { type: String, required: true },
  lastSynced: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
