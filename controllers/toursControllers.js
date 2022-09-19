const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checksId = function (req, res, next, val) {
  // console.log(val, +val);
  const tour = tours.find((tour) => tour.id === +val);
  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found!',
    });
  }
  next();
};

exports.checksBody = function (req, res, next) {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({
      success: false,
      message: 'Tour should have a name.',
    });
  } else if (!body.price) {
    return res.status(400).json({
      success: false,
      message: 'Tour should have a price.',
    });
  }
  next();
};

exports.getAllTours = function (req, res) {
  res.status(200).json({
    success: true,
    requestedAt: req.requestTime,
    results: tours.length,
    tours,
  });
};

exports.getTour = function (req, res) {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);
  res.status(200).json({
    success: true,
    tour,
  });
};

exports.createTour = function (req, res) {
  const newId = tours[tours.length - 1]?.id + 1 || 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      if (err) throw new Error(err);
      res.status(201).json(newTour);
    }
  );
};

exports.updateTour = function (req, res) {
  const id = +req.params.id;
  const update = req.body;
  const toBeUpdatedTourIndex = tours.findIndex((tour) => tour.id === id);
  const updatedTour = { ...tours[toBeUpdatedTourIndex], ...update };
  tours[toBeUpdatedTourIndex] = updatedTour;
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      if (err) throw new Error(err);
      res.status(200).json({
        success: true,
        tour: updatedTour,
      });
    }
  );
};

exports.deleteTour = function (req, res) {
  const id = +req.params.id;
  const toBeDeletedTourIndex = tours.findIndex((tour) => tour.id === id);
  tours.splice(toBeDeletedTourIndex, 1);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      if (err) throw new Error(err);
      res.status(204).json({
        success: true,
        data: null,
      });
    }
  );
};
