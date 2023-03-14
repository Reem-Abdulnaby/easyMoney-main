const mongoose = require('mongoose')
const validator = require('validator')
const timestamps = require('mongoose-timestamp')
const contactUs = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  phone: {
    type: String,
    validate(value) {
      if (!validator.isMobilePhone(value, ['ar-EG'])) {
        throw new Error('Phone number is invalid')
      }
    }
  },
  message: {
    type: String
  },
  state: {
    type: Number,
    default: 0
  },
})
contactUs.plugin(timestamps)
const ContactUs = mongoose.model('contactus', contactUs)
module.exports = ContactUs