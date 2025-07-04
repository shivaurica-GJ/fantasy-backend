const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  otp: {
    type: String,
    select: false
  },
  name: String,
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', '']
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Update timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  // Check if profile is complete
  if (this.name && this.email && this.gender) {
    this.isProfileComplete = true;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);