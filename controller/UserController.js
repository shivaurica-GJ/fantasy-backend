const User = require('../models/User');
const mongoose = require('mongoose'); 
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const addUser = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    let user = await User.findOne({ phone }).session(session);
    
    if (user) {
      user.otp = otp;
      user.otpCreatedAt = new Date();
      await user.save({ session });
      console.log(`OTP updated for existing user: ${otp}`);
    } else {
      user = new User({ 
        phone, 
        otp, 
        otpCreatedAt: new Date() 
      });
      await user.save({ session });
      console.log(`New user created with OTP: ${otp}`);
    }

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: `+91${phone}`
    });

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp // Remove in production - only for testing
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('OTP generation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message 
    });
  } finally {
    session.endSession();
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ 
      error: 'Phone and OTP are required',
      received: { phone, otp }
    });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    
    const user = await User.findOne({ phone })
      .session(session)
      .select('+otp +otpCreatedAt');

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otp || !user.otpCreatedAt) {
      await session.abortTransaction();
      return res.status(401).json({ error: 'No active OTP found' });
    }

    // Check OTP expiration (10 minutes)
    const otpAge = Date.now() - user.otpCreatedAt.getTime();
    if (otpAge > 10*60*1000) {
      await session.abortTransaction();
      return res.status(401).json({ 
        error: 'OTP expired',
        details: `OTP was generated ${Math.floor(otpAge/1000)} seconds ago`
      });
    }

    if (user.otp !== otp) {
      await session.abortTransaction();
      return res.status(401).json({ 
        error: 'Invalid OTP',
        details: {
          storedOtp: user.otp,
          receivedOtp: otp
        }
      });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save({ session });

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        phone: user.phone,
        _id: user._id
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  } finally {
    session.endSession();
  }
};


const getUser = async (req, res) => {
     console.log('Request params:', req.params);
  console.log('Request query:', req.query);
 const { phone } = req.params;


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

  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }

  try {
    const user = await User.findOne({ phone }).select('+otp');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (name !== undefined) {
      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
      user.name = name;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      user.email = email;
    }

    if (gender !== undefined) {
      if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({ error: 'Invalid gender value' });
      }
      user.gender = gender;
    }

    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        isProfileComplete: !!(user.name && user.email && user.gender)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
};
const getUserProfile = async (req, res) => {
  const { phone } = req.params;

  try {
    const user = await User.findOne({ phone }).select('+otp');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const response = {
      name: user.name || null,
      email: user.email || null,
      phone: user.phone,
      gender: user.gender || null,
      isProfileComplete: user.isProfileComplete,
      missingFields: []
    };

    // Identify missing fields
    if (!user.name) response.missingFields.push('name');
    if (!user.email) response.missingFields.push('email');
    if (!user.gender) response.missingFields.push('gender');

    if (!response.isProfileComplete) {
      response.message = `Profile incomplete. Missing: ${response.missingFields.join(', ')}`;
    } else {
      response.message = 'Profile complete';
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
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
