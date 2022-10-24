const express = require('express');

const {
  signUpUser,
  signInUser,
  forgotPassword,
  resetPassword,
  authenticate,
  updatePassword,
  authorizeWith,
} = require('../controllers/authControllers');

const usersController = require('./../controllers/usersController');

const router = express.Router();

router.post('/signup', signUpUser);
router.post('/signin', signInUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);

router.use(authenticate); // Every route after this auth middleware now has to be authenticated before the requests can proceed

router.patch('/updateMyPassword', updatePassword);
router.get('/me', usersController.getMe, usersController.getUser);
router.patch('/updateMe', usersController.updateMe);
router.delete('/deleteMe', usersController.deleteMe);

router.use(authorizeWith('admin'));

router.route('/').get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
