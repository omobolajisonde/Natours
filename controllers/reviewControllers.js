const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');

exports.getAllReviews = catchAsync(async function (req, res, next) {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; // gets all reviews for a specific tour, if tourId is in the url
  const reviews = await Review.find(filter);
  res.status(200).json({
    success: true,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async function (req, res, next) {
  console.log(req.params);
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user._id;
  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      review,
    },
  });
});
