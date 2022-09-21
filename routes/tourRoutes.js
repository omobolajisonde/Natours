const express = require('express');

const toursController = require('./../controllers/toursControllers');

const router = express.Router();

// router.param('id', toursController.checksId);

router
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.createTour);

router
  .route('/:id([0-9]+)')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
