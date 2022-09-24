const Tour = require('../models/toursModel');

exports.getAllTours = async function (req, res) {
  try {
    const queryObj = { ...req.query };
    const excludedKeys = ['page', 'sort', 'limit', 'fields'];
    excludedKeys.forEach((key) => delete queryObj[key]);
    const query = Tour.find(queryObj);
    const tours = await query;
    res.status(200).json({
      success: true,
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
