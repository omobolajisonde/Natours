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
router.get(
  '/monthly-plan/:year',
  authenticate,
  authorizeWith('admin', 'lead-guide', 'guide'),
  toursController.getMonthlyPlan
);

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  toursController.getToursWithin
);

router
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authenticate,
    authorizeWith('admin', 'lead-guide'),
    toursController.createTour
  );

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authenticate,
    authorizeWith('admin', 'lead-guide'),
    toursController.updateTour
  )
  .delete(
    authenticate,
    authorizeWith('admin', 'lead-guide'),
    toursController.deleteTour
  );

module.exports = router;
// .route('/:id([0-9]+)')
