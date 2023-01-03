const express = require('express');
const router = express.Router();
const {getDashboard, forgotPassword, getUserProfile, logoutUser, editUserProfile, editUserProfilePost
, shortenUrl, getAllUrls, handleFavoriteLink, getFavoriteLinks, getAnalytics, exportUrls, exportUrlsAsPdf} = require('../controllers/user/user');
const {ensureAuthenticated} = require('../config/auth');


router.route('/dashboard').get(ensureAuthenticated, getDashboard);
router.route('/profile').get(ensureAuthenticated, getUserProfile);
router.route('/edit-profile').get(ensureAuthenticated, editUserProfile).post(editUserProfilePost);
router.route('/shorten-url').post(ensureAuthenticated, shortenUrl);
router.route('/all-urls').get(ensureAuthenticated, getAllUrls).post(handleFavoriteLink);
router.route('/favorite-urls').get(ensureAuthenticated, getFavoriteLinks);
router.route('/analytics').get(ensureAuthenticated, getAnalytics);
router.route('/export-urls').get(ensureAuthenticated, exportUrls);
router.route('/export-urls-as-pdf').get(ensureAuthenticated, exportUrlsAsPdf);
router.route('/forgot-password').get(forgotPassword);
router.route('/logout').get(ensureAuthenticated, logoutUser);

module.exports = router;