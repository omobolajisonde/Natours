const express = require('express');
const {
  getAllReviews,
  getReview,
  setTourAndUserIds,
  createReview,
  deleteReview,
  updateReview,
} = require('../controllers/reviewControllers');

const {
  authenticate,
  authorizeWith,
} = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(authenticate, authorizeWith('user'), setTourAndUserIds, createReview);
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);
module.exports = router;
