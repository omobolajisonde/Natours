const express = require('express');

const {
  signUpUser,
  signInUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authControllers');

const usersController = require('./../controllers/usersController');

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/signin', signInUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

router
  .route('/:id([0-9]+)')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
