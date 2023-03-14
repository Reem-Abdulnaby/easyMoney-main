const express = require('express')
const routes = express.Router()
const productsController = require('../../../controllers/products.controller')
// const usersController = require('../../../controllers/users.controller')
const auth = require('../../../middleware/auh')
const {Uploads} = require('../../../utils/uploadPhoto')


// routes do not need for authentication
routes.route('/get-status').get(productsController.getProductStatus)
routes.route('/get-all').get(productsController.getAll)
routes.route('/get-all-categories').get(productsController.getAllCat)
routes.route('/id/:id').get(productsController.getProductById)
routes.route('/name/:name').get(productsController.getProductsByName)
routes.route('/category/:category').get(productsController.getProductsByCategory)
routes.route('/seller/:seller').get(productsController.getProductsBySellerID)

// routes need for authentication
// routes.use(auth)
routes.route('/get-own-products').get(auth, productsController.sellerGetOwn)
routes.route('/:id')
  .delete(auth, productsController.deleteProduct)
  .patch(Uploads.array('avatar', 8), auth, productsController.updateProduct)
// routes.route('/get').get(productsController.sellerGetOwn)
routes.use(Uploads.array('avatar', 8)).route('/create').post(auth, productsController.createProduct)
module.exports = routes