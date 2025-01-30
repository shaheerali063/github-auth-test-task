const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {encrypt, decrypt} = require('../helpers/encryption')

// Define User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  accessToken: { type: String, required: true },
  lastSynced: { type: Date, required: true },
});

// Encrypt before saving
userSchema.pre('save', function (next) {
  if (this.isModified('accessToken')) {
    this.accessToken = encrypt(this.accessToken);
  }
  next();
});

// Decrypt when retrieving
userSchema.methods.getDecryptedAccessToken = function () {
  return decrypt(this.accessToken);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
