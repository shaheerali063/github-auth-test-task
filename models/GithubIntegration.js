const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {encrypt, decrypt} = require('../helpers/encryption')

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  accessToken: { type: String, required: true },
  lastSynced: { type: Date, required: true },
});

userSchema.pre('save', function (next) {
  if (this.isModified('accessToken')) {
    this.accessToken = encrypt(this.accessToken);
  }
  next();
});

userSchema.methods.getDecryptedAccessToken = function () {
  return decrypt(this.accessToken);
};

const githubIntegration = mongoose.model('githubIntegration', userSchema);

module.exports = githubIntegration;
