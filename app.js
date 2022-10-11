const express = require('express');
const logger = require('morgan');

const AppError = require('./utils/appError');
const globalErrorMiddleware = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// APP INITIALIZATION
const app = express();

// APP VARIABLES
const API_BASE_URL = '/api/v1';

// APP REQUEST LOGS FOR DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

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

// Any request that makes it to this part has lost it's way
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   success: false,
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

// Global Error Handling middleware
app.use(globalErrorMiddleware);

module.exports = app;
