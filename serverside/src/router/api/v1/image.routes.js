const express = require('express');
const routes = express.Router();
const imageController = require('../../../controllers/image.controller');
const { Uploads } = require('../../../utils/uploadPhoto');

routes.route('/').post(Uploads.any() , imageController.uploadImages);

module.exports = routes;