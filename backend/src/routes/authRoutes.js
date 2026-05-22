const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, updateProfile, changePassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword)
module.exports = router;