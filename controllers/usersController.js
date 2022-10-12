const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async function (req, res, next) {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    results: users.length,
    data: { users },
  });
});
exports.getUser = function (req, res) {
  res.status(500).json({
    success: false,
    message: 'endpoint yet to be implemented',
  });
};
exports.createUser = function (req, res) {
  res.status(500).json({
    success: false,
    message: 'endpoint yet to be implemented',
  });
};
exports.updateUser = function (req, res) {
  res.status(500).json({
    success: false,
    message: 'endpoint yet to be implemented',
  });
};
exports.deleteUser = function (req, res) {
  res.sendStatus(500).json({
    success: false,
    message: 'endpoint yet to be implemented',
  });
};
