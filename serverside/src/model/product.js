const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const { User } = require('./user')
const validator = require('validator')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5
    },
    image: [{
        type: String,
        // required:true
    }],
    originalPrice: {
        type: Number,
        required: true,
        maxLength: [8, "Price cannot exceed 8 characters"]
    },
    sellPrice: {
        type: Number,
        maxLength: [8, "Price cannot exceed 8 characters"],
    }
    ,
    description: {
        type: String,
        required: true,
        trim: true
    },
    properties: [{
        color: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    total_amount: {
        type: Number,
        default: 0,
        maxLength: [5, "Stock cannot exceed 5 characters"]
    },
    rate: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0,
    },
    reviews: [{
        buyerId: {
            type: mongoose.Types.ObjectId,
            ref: User,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        comment: {
            type: String,
        }
    }],
    shipping_price: {
        cairo: {
            type: Number,
            default: 35,
            required: true,
        },
        giza: {
            type: Number,
            default: 35,
            required: true,
        },
        alexandria: {
            type: Number,
            default: 35,
            required: true,
        },
        "ain sokhna": {
            type: Number,
            default: 50,
            required: true,
        },
        "al Fayoum": {
            type: Number,
            default: 50,
            required: true,
        },
        "al gharbia": {
            type: Number,
            default: 50,
            required: true,
        },
        "al sharqia": {
            type: Number,
            default: 50,
            required: true,
        },
        aswan: {
            type: Number,
            default: 50,
            required: true,
        },
        asyut: {
            type: Number,
            default: 50,
            required: true,
        },
        "bani sweif": {
            type: Number,
            default: 50,
            required: true,
        },
        dakahlia: {
            type: Number,
            default: 50,
            required: true,
        },
        damietta: {
            type: Number,
            default: 50,
            required: true,
        },
        "el beheira": {
            type: Number,
            default: 50,
            required: true,
        },
        "el menya": {
            type: Number,
            default: 50,
            required: true,
        },
        "red sea": {
            type: Number,
            default: 50,
            required: true,
        },
        ismailia: {
            type: Number,
            default: 50,
            required: true,
        },
        "kafr el sheikh": {
            type: Number,
            default: 50,
            required: true,
        },
        "new valley": {
            type: Number,
            default: 50,
            required: true,
        },
        "north sinai": {
            type: Number,
            default: 50,
            required: true,
        },
        matruh: {
            type: Number,
            default: 50,
            required: true,
        },
        luxor: {
            type: Number,
            default: 50,
            required: true,
        },
        "el menofia": {
            type: Number,
            default: 50,
            required: true,
        },
        "port said": {
            type: Number,
            default: 50,
            required: true,
        },
        qena: {
            type: Number,
            default: 50,
            required: true,
        },
        sohag: {
            type: Number,
            default: 50,
            required: true,
        },
        "south of sinai": {
            type: Number,
            default: 50,
            required: true,
        },
        suez: {
            type: Number,
            default: 50,
            required: true,
        },
    }

    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // }
})
productSchema.plugin(timestamps)
const Product = mongoose.model('products', productSchema)
module.exports = Product