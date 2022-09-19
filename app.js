const express = require('express');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// APP INITIALIZATION
const app = express();

// APP VARIABLES
const API_BASE_URL = '/api/v1';

// Serving static files
app.use(express.static('public'));

// Middleware to parse the request body
app.use(express.json());

// Custom middle ware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(`${API_BASE_URL}/tours`, tourRouter);

app.use(`${API_BASE_URL}/users`, userRouter);

module.exports = app;
