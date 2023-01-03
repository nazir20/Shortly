const express = require('express');
const router = express.Router();
const {getHomePage, getLoginPage, loginUser, getSignupPage, signupUser, getDashboard, redirectToOriginalUrl} = require('../controllers/home/home');
const {ensureAuthenticated} = require('../config/auth');


router.route('/').get(getHomePage);
router.route('/login').get(getLoginPage).post(loginUser)
router.route('/signup').get(getSignupPage).post(signupUser);
router.route('/dashboard').get(ensureAuthenticated,getDashboard);
router.route('/:url_id').get(redirectToOriginalUrl);

module.exports = router;