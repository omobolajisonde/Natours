const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password.'],
    minLength: 8,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
