const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
  passwordModifiedAt: { type: Date },
  passwordResetToken: String,
  passwordResetTokenExpiresIn: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

// Query /find/ middleware/hook
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
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
  next();
});

// Update the passwordModifiedAt after password change

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordModifiedAt = Date.now() - 1000; // setting it to 1 sec in the past cause the actual saving might happen after jwt is issued
  next();
});
// All documents created from this schema would have access to these methods

userSchema.methods.correctPassword = async function (
  enteredPassword,
  userHashedPassword
) {
  return await bcrypt.compare(enteredPassword, userHashedPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTIATTimeStamp) {
  if (this.passwordModifiedAt) {
    const passwordModifiedAtTimeStamp = parseInt(
      this.passwordModifiedAt.getTime() / 1000,
      10
    );
    // console.log(JWTIATTimeStamp, passwordModifiedAtTimeStamp);
    return JWTIATTimeStamp < passwordModifiedAtTimeStamp;
  }
  return false;
};

// Generates password reset token

userSchema.methods.genResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
