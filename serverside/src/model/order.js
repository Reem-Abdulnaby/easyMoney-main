const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const validator = require('validator')
const { User } = require('./user')
const Product = require('./product')
const Admin = require('./admin')
const orderSchema = mongoose.Schema({
    sellerId: {
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true
    },
    buyerId: {
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true
    },
    adminId: {
        type: mongoose.Types.ObjectId,
        ref: Admin,
    },
    sellPrice: {
        type: Number,
        required: true
    },
    newPrice: {
        type: Number,
        required: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: Product,
        required: true
    },
    orderItems: [
        {
            propertyId: {
                type: mongoose.Types.ObjectId,
                ref: Product,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
    ,
    name: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            if (!validator.isMobilePhone(value, ['ar-EG'])) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    subPhone: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value, ['ar-EG'])) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    area: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    subAddress: {
        type: String,
        trim: true,
        default: ''
    },
    shippingPrice: {
        type: Number,
        required: true
    },
    storeName: {
        type: String,
        trim: true,
        required: true
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    totalPrice: {
        type: Number,
        default: 0,
        required: true
    },
    websiteTax: {
        type: Number,
        default: 0
    }
    ,
    buyerCommission: {
        type: Number,
        default: 0
    },
    orderState: {
        type: Number,
        default: 0
    },
    deliveredAt: {
        type: Date
    }
})
orderSchema.plugin(timestamps)
const Order = mongoose.model('orders', orderSchema)
module.exports = Order