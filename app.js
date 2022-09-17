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

app.get(`${API_BASE_URL}/tours`, (req, res) => {
  res.status(200).json({
    success: true,
    results: tours.length,
    tours,
  });
});

app.get(`${API_BASE_URL}/tours/:id`, (req, res) => {
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
});

app.post(`${API_BASE_URL}/tours`, (req, res) => {
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
});

app.patch(`${API_BASE_URL}/tours/:id([0-9]+)`, (req, res) => {
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
});

app.delete(`${API_BASE_URL}/tours/:id([0-9]+)`, (req, res) => {
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
});

app.listen(PORT, HOST, () => {
  console.log(`Running on port ${PORT}...`);
});
