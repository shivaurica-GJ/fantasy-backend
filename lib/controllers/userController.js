const User = require('../models/User');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const addUser = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: 'Phone is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    let user = await User.findOne({ phone });

    if (user) {
      user.otp = otp;
      await user.save();
    } else {
      user = new User({ phone, otp });
      await user.save();
    }

    // ✅ Send OTP via SMS using Twilio
    await client.messages.create({
      body: `Shiv Aurica OTP: ${otp}. It is valid for 10 minutes. Never share this code with anyone.`,
      from: twilioPhone,
      to: `+91${phone}` // Make sure phone format is correct
    });

    res.status(200).json({ success: true, message: 'OTP sent via SMS', otp }); // optional to include OTP
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  try {
    const user = await User.findOne({ phone }).select('+otp');


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // ✅ Optional: Clear OTP after successful verification
    user.otp = null;
    await user.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUser = async (req, res) => {
 const { phone } = req.query;


  try {
    const user = await User.findOne({ phone }).select('+otp');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { phone, name, email, gender } = req.body;

  try {
    const user = await User.findOne({ phone }).select('+otp');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const { phone } = req.query;

  try {
   const user = await User.findOne({ phone }).select('+otp');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return only necessary profile info
    const profileData = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone,
      gender: user.gender || ''
    };

    res.status(200).json(profileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to your exports
module.exports = {
  addUser,
  verifyOtp,
  getUser,
  updateUserProfile,
  getUserProfile
};

