const fs = require('fs');

const express = require('express');

const app = express();

const PORT = 8000;
const HOST = '127.0.0.1';
const API_BASE_URL = '/api/v1';

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Middleware to parse the request body
app.use(express.json());

const getAllTours = function (req, res) {
  res.status(200).json({
    success: true,
    results: tours.length,
    tours,
  });
};

const getTour = function (req, res) {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour.id === id);
  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found!',
    });
  }
  res.status(200).json({
    success: true,
    tour,
  });
};

const createTour = function (req, res) {
  const newId = tours[tours.length - 1]?.id + 1 || 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      if (err) throw new Error(err);
      res.status(201).json(newTour);
    }
  );
};

const updateTour = function (req, res) {
  const id = +req.params.id;
  const update = req.body;
  const toBeUpdatedTourIndex = tours.findIndex((tour) => tour.id === id);
  if (toBeUpdatedTourIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found!',
    });
  }
  const updatedTour = { ...tours[toBeUpdatedTourIndex], ...update };
  tours[toBeUpdatedTourIndex] = updatedTour;
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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

const deleteTour = function (req, res) {
  const id = +req.params.id;
  const toBeDeletedTourIndex = tours.findIndex((tour) => tour.id === id);
  if (toBeDeletedTourIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found!',
    });
  }
  tours.splice(toBeDeletedTourIndex, 1);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
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

app.get(`${API_BASE_URL}/tours`, getAllTours);

app.get(`${API_BASE_URL}/tours/:id`, getTour);

app.post(`${API_BASE_URL}/tours`, createTour);

app.patch(`${API_BASE_URL}/tours/:id([0-9]+)`, updateTour);

app.delete(`${API_BASE_URL}/tours/:id([0-9]+)`, deleteTour);

app.listen(PORT, HOST, () => {
  console.log(`Running on port ${PORT}...`);
});
