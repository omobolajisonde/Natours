const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const {
  getAll,
  getOne,
  updateOne,
  createOne,
  deleteOne,
} = require('./factoryHandler');

exports.setTourAndUserIds = function (req, res, next) {
  console.log(req.params);
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user._id;
  next();
};
exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review, 'Review');
exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review, 'Review');
exports.deleteReview = deleteOne(Review, 'Review');
