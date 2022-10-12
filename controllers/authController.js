const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const getSignedToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUpUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = getSignedToken(user._id);

  return res.status(201).json({
    success: true,
    token,
    data: {
      user,
    },
  });
});

exports.signInUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Checks if email and password is indeed provided
  if (!email || !password) {
    return next(
      new AppError('You need both your email and password to login.', 400)
    );
  }
  // Finds user and compare password
  const user = await User.findOne({ email }).select(['password']);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password not correct!', 401));
  }
  //   Generates token
  const token = getSignedToken(user._id);
  return res.status(200).json({
    success: true,
    token,
  });
});
