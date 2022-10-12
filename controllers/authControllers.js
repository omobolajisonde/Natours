const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.auth = catchAsync(async (req, res, next) => {
  let token;
  // Check if a Bearer Token is present in the request header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not logged in. Please login to gain access', 401)
    );

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // Checks if User with id claim still exists
  const claimUser = await User.findById(decoded.id);
  if (!claimUser)
    return next(
      new AppError('User associated with token no longer exists!', 401)
    );
  // Check if user changed their password after being issued the token
  const passwordIsModified = claimUser.changedPasswordAfter(decoded.iat);
  if (passwordIsModified)
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  // Grants Access!
  res.locals.user = claimUser;
  next();
});

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
