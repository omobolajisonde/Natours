const mongoose = require('mongoose');
const slugify = require('slugify');

// First steps with Schemas

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'Tour name should not be longer than 40 characters'],
      minLength: [10, 'Tour name should not be lesser than 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty can only be any of "easy", "medium" or "difficult"',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, "Tour average rating can't be less than nothing"],
      max: [5, "Tour average rating can't be more than five"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        // custom validation using the validate property
        function (value) {
          // p.s this = the current doc only during creaton. During, updating nah!
          return value < this.price;
        },
        'The discounted price, {VALUE} should not be more than the original price homie!',
      ],
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a bg image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false, // select property determines whether or not a field should be returned in reading results
    },
    startDates: [Date],
    secret_tour: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true }, // when requesting a JSON output, the virtual properties should be added to the returned fields
    toObject: { virtuals: true }, // when requesting an Object output, the virtual properties should be added to the returned fields
  }
);

// Virtual properties
tourSchema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

// MIDDLEWARE IN THE MONGOOSE WORLD

// Document Middleware
// * pre save middleware or hook
tourSchema.pre('save', function (next) {
  // this = currently processed document
  this.slug = slugify(this.name, {
    replacement: '_',
    lower: true,
  });
  next();
});

// * post save middleware or hook
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware
// * pre save middleware or hook
tourSchema.pre(/^find/, function (next) {
  // /^find/ regexp, is so that it runs for every query method that starts with "find"
  this.find({ secret_tour: { $ne: true } });
  next();
});

// * post save middleware or hook
// tourSchema.post(/^find/, function (doc, next) {
//   console.log(doc);
//   next();
// });

// Aggregate Middleware
// *pre aggregate middleware or hook
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secret_tour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
