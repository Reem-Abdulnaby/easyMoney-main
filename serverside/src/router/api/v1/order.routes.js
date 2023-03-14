const express = require('express')
const routes = express.Router()
const ordersController = require('../../../controllers/order.controller')
const auth = require('../../../middleware/auh')

routes.route('/add').post(auth, ordersController.createOrder)
routes.route('/:id').get(auth, ordersController.getOrder)
routes.route('/:id').patch(auth, ordersController.updateOrder)

module.exports = routes