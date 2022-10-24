const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "C'mon express your opinion about this tour."],
    },
    ratings: {
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
