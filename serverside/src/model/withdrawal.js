const mongoose = require('mongoose')
const { User } = require('./user')
const validator = require('validator')
const timestamps = require('mongoose-timestamp')
const withdrawal = mongoose.Schema({
  buyerId: {
    type: mongoose.Types.ObjectId,
    ref: User,
    required: true,
  },
  transactionId: {
    type: Number,
    trim: true,
    default: null
  },
  state: {
    type: Number,
    default: 0
  },
  withdrawnAmount: {
    type: Number,
    required: true,
    trim: true
  },
  totalBalance: {
    type: Number,
    required: true
  },
  balanceAfterWithdrawn: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    required: true,
    enum: ['vodafone cash', 'orange cash', 'we cash', 'etsalat cash']
  },
  payment_method_number: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isMobilePhone(value))
        throw new Error("Phone is invalid")
    }
  }
})
withdrawal.plugin(timestamps)
const Withdrawal = mongoose.model('withdrawals', withdrawal)
module.exports = Withdrawal