const express = require('express');

const toursController = require('./../controllers/toursControllers');
const {
  authenticate,
  authorizeWith,
} = require('./../controllers/authControllers');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.get(
  '/top-5-cheap',
  toursController.aliasTopTours,
  toursController.getAllTours
); // Aliasing common route

router.get('/tour-stats', toursController.getTourStats);
router.get('/monthly-plan/:year', toursController.getMonthlyPlan);

router
  .route('/')
  .get(authenticate, toursController.getAllTours)
  .post(toursController.createTour);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    authenticate,
    authorizeWith('admin', 'lead-guide'),
    toursController.deleteTour
  );

module.exports = router;
// .route('/:id([0-9]+)')
