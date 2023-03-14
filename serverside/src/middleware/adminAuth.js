const jwt = require('jsonwebtoken')
const Admin = require('../model/admin')
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        // console.log(token)
        const decode = jwt.verify(token, 'AdminToken')
        const admin = await Admin.findOne({ _id: decode._id, token })
        admin.token = null
        // console.log(admin)
        if (!admin)
            throw new Error('')
        req.admin = admin
        req.token = token
        next()
    }
    catch (e) {
        res.status(401).send("Please Authenticate !!")
    }
}
module.exports = auth