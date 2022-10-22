const express = require('express');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorMiddleware = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// APP INITIALIZATION
const app = express();

// APP VARIABLES
const API_BASE_URL = '/api/v1';

// GLOBAL MIDDLEWARES

// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

// APP REQUEST LOGS FOR DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

// Middleware to parse the request body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL query injections
app.use(mongoSanitize());
// Data sanitization against XSS attacks
app.use(xss());
// Handling http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// Serving static files
app.use(express.static('public'));

// rate limit implementation
const limiter = rateLimit({
  max: 100, // max allowable number of request from an IP address in a given timeframe
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from your IP address, please try again later.',
});
app.use('/api', limiter);

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
