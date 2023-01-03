const express = require('express');
const router = express.Router();
const {getDashboard, getProfile, editProfile, editProfilePost, viewUsers, viewUserInfo, deleteUser, linkAnalytics, logoutAdmin} = require('../controllers/admin/admin');
const {ensureAuthenticated} = require('../config/auth');



router.route('/dashboard').get(ensureAuthenticated, getDashboard);
router.route('/profile').get(ensureAuthenticated, getProfile);
router.route('/edit-profile').get(ensureAuthenticated, editProfile).post(ensureAuthenticated, editProfilePost);
router.route('/view-users').get(ensureAuthenticated, viewUsers);
router.route('/view/user/:user_id').get(ensureAuthenticated, viewUserInfo).post(ensureAuthenticated, deleteUser);
router.route('/link-analytics').get(ensureAuthenticated, linkAnalytics);
router.route('/logout').get(ensureAuthenticated, logoutAdmin);


module.exports = router;