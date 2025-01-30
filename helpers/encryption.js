const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes
const IV_KEY = process.env.IV_KEY; // Must be 16 bytes

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
}

if (!IV_KEY || IV_KEY.length !== 16) {
  throw new Error('IV_KEY must be exactly 16 characters');
}

// Encrypt Function
function encrypt(text) {
  const iv = Buffer.from(IV_KEY, 'utf-8'); // Convert IV_KEY to Buffer
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt Function
function decrypt(text) {
  const iv = Buffer.from(IV_KEY, 'utf-8'); // Convert IV_KEY to Buffer
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
