const express = require('express');

const toursController = require('./../controllers/toursControllers');

const router = express.Router();

router.get(
  '/top-5-cheap',
  toursController.aliasTopTours,
  toursController.getAllTours
); // Aliasing common route

router.get('/tour-stats', toursController.getTourStats);
router.get('/monthly-plan/:year', toursController.getMonthlyPlan);

router
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.createTour);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
// .route('/:id([0-9]+)')
