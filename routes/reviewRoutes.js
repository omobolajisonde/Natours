const express = require('express');
const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewControllers');

const {
  authenticate,
  authorizeWith,
} = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(authenticate, authorizeWith('user'), createReview);

module.exports = router;
