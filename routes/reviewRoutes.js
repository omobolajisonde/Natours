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

router.use(authenticate);

router
  .route('/')
  .get(getAllReviews)
  .post(authorizeWith('user'), setTourAndUserIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(authorizeWith('admin', 'user'), updateReview)
  .delete(authorizeWith('admin', 'user'), deleteReview);
module.exports = router;
