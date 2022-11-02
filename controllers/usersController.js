const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getOne, updateOne, deleteOne, getAll } = require('./factoryHandler');

const filterBody = function (body, ...allowedFields) {
  const filteredBody = {};
  Object.keys(body).forEach((field) => {
    if (allowedFields.includes(field)) filteredBody[field] = body[field];
  });
  return filteredBody;
};

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User, 'User');
exports.updateUser = updateOne(User, 'User');
exports.deleteUser = deleteOne(User, 'User');

exports.getMe = function (req, res, next) {
  req.params.id = req.user._id; // manually add the current user id to the req params so the getUser controller can work
  next();
};

exports.updateMe = catchAsync(async function (req, res, next) {
  // 1. Check if user tries to update password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not meant for password updates. Use /users/updateMyPassword instead.',
        400
      )
    );
  }
  // 2. Filter unwanted fields from the req.body
  const filteredBody = filterBody(req.body, 'name', 'email');
  // 3. Update user data
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true, // runs validators for only updated fields, unlike save (validateBeforeSave) which runs for all fields regardless
  });
  return res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  return res.status(204).json({
    success: true,
    data: null,
  });
});
