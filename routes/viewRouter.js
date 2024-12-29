const express = require('express');
const router = express.Router();
const {getOverview,getTour,getLoginForm} = require('../controllers/viewController');
const { isLoggedIn } = require('../controllers/authController');


router.use(isLoggedIn)

router.get('/login',getLoginForm)
router.get('/',getOverview)
router.get('/tour/:slug',getTour)



module.exports = router