const mongoose = require('mongoose');

const Tour = require('./tourModel');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "C'mon express your opinion about this tour."],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [
        true,
        "C'mon express your opinion about this tour by rating it.",
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: ObjectId,
      ref: 'Tour',
      required: [true, 'Review must be assoicated with a Tour'],
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: [true, 'Review must be made by a User.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // Creates a unique compound index. We use this trick so that a user can't have more than one review on a tour.

reviewSchema.statics.calcAndSetRatingsDetailsOnTour = async function (tourId) {
  const tourRatingStats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(tourRatingStats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: tourRatingStats.length ? tourRatingStats[0].nRating : 0,
    ratingsAverage: tourRatingStats.length ? tourRatingStats[0].avgRating : 4.5,
  });
};

// Document middleware
reviewSchema.post('save', async function () {
  await this.constructor.calcAndSetRatingsDetailsOnTour(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne(); // cloning the query, then execution to get the document and storing the retrieved document as a property on the query object so it can be accessible in th post hook.
  console.log(this.review);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.review?.constructor.calcAndSetRatingsDetailsOnTour(
    this.review.tour
  );
});

// Query middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
