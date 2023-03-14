const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const bcryptjs = require('bcryptjs')

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        default: '',
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
            let strongPass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")
            if (!strongPass.test(value))
                throw new Error("Password must contain at least one capital/small letter & special character and number")
        }
    },
    phone: {
        type: String,
        validate(value) {
            if (!validator.isMobilePhone(value))
                throw new Error("Phone is invalid")
        },
        default: '01010101010'
    },
    image: {
        type: String,
        default: '',
    },
    token: [
        {
            type: String,
            require: true
        }
    ],
    LoginCode: {
        type: String
    },
    resetLink: {
        type: String
    }
})
adminSchema.pre('save', async function () {
    const admin = this
    if (admin.isModified('password'))
        admin.password = await bcryptjs.hash(admin.password, 8)
})
adminSchema.statics.logIn = async function (email, pass) {
    const admin = await Admin.findOne({ email })
    if (!admin) {
        throw new Error('Password or Email is wrong')
    }
    console.log(admin.password)
    const isMatch = await bcryptjs.compare(pass, admin.password)
    if (!isMatch)
        throw new Error('Password or Email is wrong')
    return admin

}
adminSchema.methods.getToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id }, 'AdminToken')
    admin.token = admin.token.concat(token)
    await admin.save()
    return token

}

adminSchema.methods.toJSON = function () {
    const admin = this
    const adminObj = admin.toObject()
    return adminObj

}
const Admin = mongoose.model('admin', adminSchema)
module.exports = Admin