const express = require('express')
const router = express.Router()
const multer = require('multer')
const User = require('../model/user')
const auth = require('../middleware/auh')

const Uploads = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
            return cb(new Error('please upload image !'))
        cb(null, true)
    }
})
router.post('/users/signup', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateToken()
        await user.save()
        res.status(200).send(user)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.Login(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.status(200).send(user)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})
router.patch('/users/update', auth, Uploads.single('avatar'), async (req, res) => {
    try {
        const Updates = Object.keys(req.body)
        Updates.forEach((update) => { req.user[update] = req.body[update] })
        if (req.file)
            req.user.pic = req.file.buffer
        await req.user.save()
        res.status(200).send(req.user)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/users/get-all', async (req, res) => {
    try {
        const user = await User.find({})
        res.status(200).send(user)
    }
    catch (e) {
        res.status.apply(500).send(e.message)
    }
})
router.get("/users/get-all-buyers", auth, async (req, res) => {
    try {
        const user = await User.find({})
        const buyer = user.filter(el => { return el.role == 'buyer' })
        res.status(200).send(buyer)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get("/users/get-all-sellers", auth, async (req, res) => {
    try {
        const user = await User.find({})
        const seller = user.filter(el => { return el.role == 'seller' })
        res.status(200).send(seller)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.delete('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(el => {
            return el != req.token
        })
        await req.user.save()
        res.status(200).send()
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.delete('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
module.exports = router