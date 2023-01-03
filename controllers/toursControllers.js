const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  getOne,
  deleteOne,
  updateOne,
  createOne,
  getAll,
} = require('./factoryHandler');

exports.aliasTopTours = async function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields =
    'name, price, ratingsAverage, duration, difficulty, summary';
  next();
};

exports.getAllTours = getAll(Tour);

exports.getTour = getOne(Tour, 'Tour', { path: 'reviews' });

exports.createTour = createOne(Tour);

exports.updateTour = updateOne(Tour, 'Tour');

exports.deleteTour = deleteOne(Tour, 'Tour');

exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please, provide the coordinate of the point in this format: lat,lng.',
        400
      )
    );
  }
  const radius =
    unit?.toLowerCase() === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng.trim(), lat.trim()], radius] },
    },
  });
  return res.status(200).json({
    success: true,
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// Has a GEOSPATIAL aggregation stage

exports.getDistances = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please, provide the coordinate of the point in this format: lat,lng.',
        400
      )
    );
  }
  const multiplier = unit?.toLowerCase() === 'mi' ? 0.000621 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance', // new field that gets created, "distance" and holds the distance value
        distanceMultiplier: multiplier,
      }, // in this case, uses the startLocation (which is a geoSpatial index) to calculate the distance from the specified location
    },
    {
      $match: { secret_tour: { $ne: true } },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  return res.status(200).json({
    success: true,
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

exports.getTourStats = catchAsync(async function (req, res, next) {
  // Aggregation using the Aggregation Pipeline
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } }, // only documents that matches this condition would move to the next stage in the pipeline
    {
      $group: {
        // _id: null, // Grouping by nothing, meaning this is applying to the whole group coming from the prev step.
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // matches those whose _id not equal to EASY
    // },
  ]);
  res.status(200).json({
    success: true,
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    }, // For each element in the specified array field of each input document, returns a new document
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    }, // Matches only documents (tours) whose startdates falls within the specified year
    {
      $group: {
        _id: { $month: '$startDates' }, // Groups by the month
        numTours: { $sum: 1 },
        tours: { $push: '$name' }, // Returns a new array and pushes the name of the documents in each group
      },
    },
    {
      $addFields: {
        month: '$_id', // Adds a month field and sets the value to the "_id" value from the last stage
      },
    },
    {
      $project: { _id: 0 }, // Removes the _id field
    },
    { $sort: { numTours: -1 } }, // Sorts the documents by numTours in desc order
  ]);
  res.status(200).json({
    success: true,
    results: plan.length,
    plan,
  });
});
