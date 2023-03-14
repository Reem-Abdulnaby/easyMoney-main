const jwt = require('jsonwebtoken')
const { User } = require('../model/user')
// const User = re
const auth = async (req, res, next) => {
    try {
        // console.log(req)
        const token = req?.header('Authorization')?.replace('Bearer ', '')
        const decode = jwt.verify(token, 'EazyMoney')
        const user = await User.findOne({ _id: decode._id, tokens: token })
        if (user.status !== 'active')
            throw new Error('not authorized you are blocked')
        // console.log(token)
        // console.log(user)
        if (!user)
            throw new Error('Wrong Token')
        req.user = user
        req.token = token
        next()
    }
    catch (e) {
        res.status(401).send(e.message)
    }

}
module.exports = auth