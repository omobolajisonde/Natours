const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address!'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email address!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [
      true,
      "It's a dangerous world online! Please provide a password.",
    ],
    minLength: 8,
    select: false, // this field (password) won't be part of the document fields when queried.
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password.'],
    minLength: 8,
    validate: [
      function (val) {
        // this = currently processed document when creating (.save or .create) not updating
        return this.password === val;
      },
      "C'mon password must match!",
    ],
  },
});

// Document pre save middleware/hook
userSchema.pre('save', async function (next) {
  // If password path/field is unmodified (create or save) returns
  if (!this.isModified('password')) return next();
  // Salts and Hashes the password
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  // Prevents the confirmPassword from entering DB
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function (
  enteredPassword,
  userHashedPassword
) {
  return await bcrypt.compare(enteredPassword, userHashedPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
