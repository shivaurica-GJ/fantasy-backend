const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    validate: {
      validator: v => validator.isEmail(v),
      message: props => `${props.value} is not a valid email!`
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null]
  },
  otp: {
    type: String,
    select: false
  },
  otpCreatedAt: {
    type: Date,
    select: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-set isProfileComplete
userSchema.pre('save', function(next) {
  this.isProfileComplete = !!(this.name && this.email && this.gender);
  next();
});

module.exports = mongoose.model('User', userSchema);