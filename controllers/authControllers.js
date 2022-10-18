const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.authenticate = catchAsync(async (req, res, next) => {
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
  req.user = claimUser;
  next();
});

exports.authorizeWith = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Permission denied! You are not permitted to carry out this action.',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(`User with email, ${email} does not exist!`, 404));
  }
  const resetToken = user.genResetToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const body = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetPasswordUrl}.\nIf you didn't forget your password, please ignore this email!`;
  const subject = 'Your password reset token (valid for 10 min)';
  try {
    await sendEmail({
      email,
      subject,
      body,
    });
    res.status(200).json({
      success: true,
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  const { password, confirmPassword } = req.body;
  // Checks if password and confirmPassword is indeed provided
  if (!password || !confirmPassword) {
    return next(new AppError('Enter your new password and confirm it.', 400));
  }
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();
  // 3) Update passwordModifiedAt property for the user
  // 4) Log the user in, send JWT
  const jwToken = getSignedToken(user._id);
  return res.status(200).json({
    success: true,
    token: jwToken,
  });
});

exports.signUpUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
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
