const express = require('express')
const routes = express.Router()
const contactUsController = require('../../../controllers/contactUs.controller')

routes.route('/add').post(contactUsController.add);

module.exports = routes ;