const Tour = require('../models/toursModel');

exports.getAllTours = function (req, res) {
  res.status(200).json({
    success: true,
    requestedAt: req.requestTime,
    // results: tours.length,
    // tours,
  });
};

exports.getTour = function (req, res) {
  res.status(200).json({
    success: true,
    // tour,
  });
};

exports.createTour = async function (req, res) {
  try {
    const toBeCreatedTour = new Tour(req.body);
    const newTour = await toBeCreatedTour.save();

    // const newTour = await Tour.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

exports.updateTour = function (req, res) {};

exports.deleteTour = function (req, res) {};
