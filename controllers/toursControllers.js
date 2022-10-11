const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = async function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields =
    'name, price, ratingsAverage, duration, difficulty, summary';
  next();
};

exports.getAllTours = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(Tour.find({}), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  console.log('HERE');
  const tours = await features.queryObj;
  res.status(200).json({
    success: true,
    page: +req.query.page || 1,
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findById(req.params.id); // Tour.findOne({_id: req.params.id});
  if (!tour) {
    return next(
      new AppError(`Tour with id, ${req.params.id} does not exist!`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async function (req, res, next) {
  // const toBeCreatedTour = new Tour(req.body);
  // const newTour = await toBeCreatedTour.save();

  const newTour = await Tour.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async function (req, res, next) {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(
      new AppError(`Tour with id, ${req.params.id} does not exist!`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async function (req, res, next) {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id, {
    strict: true,
  });
  if (!deletedTour) {
    return next(
      new AppError(`Tour with id, ${req.params.id} does not exist!`, 404)
    );
  }
  res.status(204).json({
    success: true,
    data: null,
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
