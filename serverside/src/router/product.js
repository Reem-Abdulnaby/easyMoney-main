const express = require('express')
const router = express.Router()
const multer = require('multer')
const Product = require('../model/product')
const auth = require('../middleware/auh')
const User = require('../model/user')

const Uploads = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
            return cb(new Error('please upload image !'))
        cb(null, true)
    }
})

router.post('/addproduct', auth, Uploads.single('avatar'), async (req, res) => {
    try {
        if (req.user.role != 'seller') {
            throw new Error('unable to add product')
        }
        const product = new Product({ ...req.body, seller: req.user._id })
        if (req.file) {
            product.image = req.file.buffer
        }
        const sum = product.properties.reduce((accumulator, object) => {
            return accumulator + object.amount;
        }, 0);
        product.total_amount = sum
        await product.save()
        res.status(200).send(product)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/getallcat', async (req, res) => {
    try {
        const categories = []
        const product = await Product.find({})
        product.forEach(el => {
            if (!categories.includes(el.category))
                categories.push(el.category)
        })
        res.status(200).send(categories)
    }
    catch (e) {
        res.status(500).send(e.messsage)
    }
})
router.get('/product/getbyid/:id', async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findById(id)
        if (!product) {
            res.status(404).send('unable to found')
        }
        res.status(200).send(product)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/product/getbycat/:category', async (req, res) => {
    try {
        const catName = req.params.category
        const product = await Product.find({ category: catName })


        res.status(200).send(product)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/product/getbyname/:name', async (req, res) => {
    try {
        const productName = req.params.name
        const product = await Product.find({ name: productName })

        res.status(200).send(product)

    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/product/bysellerid/:seller', async (req, res) => {
    try {
        const sellerId = req.params.seller
        const product = await Product.find({ seller: sellerId })

        res.status(200).send(product)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})


router.patch('/product/update/:id', auth, async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findOneAndUpdate({ _id: productId, seller: req.user._id }, req.body, {
            new: true,
            runValidators: true
        })
        if (!product) {
            res.status(404).send('unable to found')
        }
        await product.save()
        res.status(200).send(product)
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.delete('/product/delete/:id', auth, async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findOneAndDelete({ _id: productId, seller: req.user._id })
        res.status(200).send('deleted succsfully')
    }
    catch (e) {
        res.status(500).send(e.message)
    }
})
router.get('/sellergetown', auth, async (req, res) => {
    try {
        await req.user.populate('products')
        res.status(200).send(req.user.products)

    }
    catch (e) {
        res.status(500).send(e)
    }

})
module.exports = router