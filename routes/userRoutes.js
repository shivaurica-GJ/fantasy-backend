const express = require('express');
const router = express.Router();

const {
  addUser,
  verifyOtp,
  getUser,
  getUserProfile,
  updateUserProfile
} = require('../controller/UserController');

// Login/Register + OTP
router.post('/add', addUser);
router.post('/verify-otp', verifyOtp);

// Profile APIs
router.get('/:phone', getUser);
router.get('/profile/:phone', getUserProfile);
router.put('/profile/update', updateUserProfile);

module.exports = router;