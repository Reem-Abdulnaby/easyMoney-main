const express = require('express')
const routes = express.Router()
const usersController = require('../../../controllers/users.controller')
const auth = require('../../../middleware/auh')
const {Uploads} = require('../../../utils/uploadPhoto')

routes.route('/signup').post(usersController.signup)
routes.route('/login').post(usersController.login)
routes.route('/get-all').get(usersController.getAll)
routes.route('/get-all-buyers').get(usersController.getAllBuyers)
routes.route('/get-all-sellers').get(usersController.getAllSellers)
routes.route('/auth/reset-password/:token').put(usersController.resetPassword)
routes.route('/forget-password').put(usersController.forgetPassword)

// routes.delete('/logout', auth, usersController.logout)
// routes.use(auth)
routes.route('/get-user').get(auth, usersController.getUser)
routes.route('/get-user-info').get(auth, usersController.getUserInfo)
//order
routes.route('/order/seller').get(auth, usersController.getSellerOrders)
routes.route('/order/buyer').get(auth, usersController.getBuyerOrders)
routes.route('/order/buyer/:id').get(auth, usersController.getBuyerOrderById)


//balance 
routes.route('/balance').get(auth, usersController.getUserBalance)

//withdrawal
routes.route('/withdrawal/buyer').get(auth, usersController.getBuyerWithdrawals);
routes.route('/withdrawal/buyer/latest').get(auth, usersController.getLatestWithdrawals);

routes.route('/change-password').put(auth, usersController.changePassword)
routes.route('/logout').delete(auth, usersController.logout)
routes.route('/logout-all-devices').delete(auth, usersController.logoutAll)
routes.use(Uploads.single('avatar')).route('/update').patch(auth, usersController.updateUser)
// routes.delete('/logout-all-devices', auth, usersController.logoutAll)

module.exports = routes;