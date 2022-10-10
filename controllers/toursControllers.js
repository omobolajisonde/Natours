const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = async function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields =
    'name, price, ratingsAverage, duration, difficulty, summary';
  next();
};

exports.getAllTours = async function (req, res) {
  try {
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
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.getTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.id); // Tour.findOne({_id: req.params.id});
    res.status(200).json({
      success: true,
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.createTour = async function (req, res) {
  try {
    // const toBeCreatedTour = new Tour(req.body);
    // const newTour = await toBeCreatedTour.save();

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.updateTour = async function (req, res) {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.deleteTour = async function (req, res) {
  try {
    await Tour.findByIdAndDelete(req.params.id, {
      strict: true,
    });
    res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error,
    });
  }
};

exports.getTourStats = async function (req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.getMonthlyPlan = async function (req, res) {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
