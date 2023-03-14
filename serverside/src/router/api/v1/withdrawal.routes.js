const express = require('express')
const routes = express.Router()
const auth = require('../../../middleware/auh')
const withdrawalController = require('../../../controllers/withdrawal.controller')

routes.route('/withdraw').post(auth, withdrawalController.create);

module.exports = routes 