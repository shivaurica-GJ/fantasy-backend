const express = require('express');
const router = express.Router();

const {
  addUser,
  verifyOtp,
  getUser,
  getUserProfile,
  updateUserProfile
} = require('../lib/controllers/userController');



// Login/Register + OTP
router.post('/add', addUser);
router.post('/verify-otp', verifyOtp);

// Profile APIs
router.get('/:phone', getUser); // optional
router.get('/profile/:phone', getUserProfile); // ✅ used in Flutter "My Info"
router.put('/profile/update', updateUserProfile); // ✅ used in Flutter "UPDATE"

module.exports = router;
