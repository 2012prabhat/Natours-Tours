const express = require('express');
const router = express.Router();
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
} = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/get-tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(protect,restrictTo('admin','lead-guide','guide'),getMonthlyPlan);



router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/tours-within/:distance/center/:latlng/unit/:unit',getToursWithin)

router
  .route('/')
  .get(protect, getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('lead-guide', 'admin'), updateTour)
  .delete(protect, restrictTo('lead-guide', 'admin'), deleteTour);

//Nested Routes
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
