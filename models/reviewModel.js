const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reviewSchema = new Schema({
  review: {
    type: String,
    required: [true, "C'mon express your opinion about this tour."],
  },
  ratings: {
    type: Number,
    min: 1,
    max: 5,
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
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
