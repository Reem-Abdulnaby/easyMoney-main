const config = require('../../config');
const sendgrid = require('@sendgrid/mail')
const multer = require('multer');
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const { User } = require('../model/user');
const auth = require('../middleware/auh');
const { json } = require('express');
const ServerError = require('../interface/Error');
// const e = require('express');
const ApiFeatures = require('../utils/ApiFeatures');
const Withdrawal = require('../model/withdrawal');
const Order = require('../model/order');
const Product = require('../model/product');
const { sendgridApiKey, sendgridEmail } = config

const Uploads = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
      return cb(new Error('please upload image !'));
    cb(null, true);
  },
});
const signup = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: user,
      token
    });
  } catch (e) {
    // console.log(e)
    // next(new ServerError(400, e.message))
    e.statusCode = 400
    next(e)
  }
};

const getBuyerData = async (user) => {
  const userData = {}
  userData.user = { ...user._doc }
  // Balance
  userData.AvailableBalance = user.balance;
  // userData.pendingWithdrawals = (await Withdrawal.find({ buyerId: user._id, state: 0 })).reduce((acc, cur) => acc += cur.withdrawnAmount, 0);
  // userData.WithdrawnBalance = (await Withdrawal.find({ buyerId: user._id, state: 1 })).reduce((acc, cur) => acc += cur.withdrawnAmount, 0);
  // userData.pendingBalance = (await Order.find({ buyerId: user._id, state: { $gte: 0 } })).reduce((acc, cur) => acc + cur.buyerCommission, 0);
  // userData.cancelledBalance = (await Order.find({ buyerId: user._id, state: { $lt: 0 } })).reduce((acc, cur) => acc + cur.buyerCommission, 0);
  // userData.profit = userData.AvailableBalance + userData.WithdrawnBalance;
  // orders
  const [
    //Balance
    pendingWithdrawals,
    WithdrawnBalance,
    pendingBalance,
    cancelledBalance,
    //Orders
    allOrders,
    ordersUnderReview,
    ordersUnderProcess,
    ordersSentToShippingCompany,
    ordersShipped,
    ordersFinished,
    cancelledOrders,
    cancelledOrdersByAdmin,
    cancelledOrdersBySeller,
    cancelledOrdersByBuyer,
    cancelledOrdersByCustomer,
    returnedOrders,
  ] = await Promise.all([
    // Balance
    Withdrawal.find({ buyerId: user._id, state: 0 }),
    Withdrawal.find({ buyerId: user._id, state: 1 }),
    Order.find({ buyerId: user._id, state: { $gte: 0 } }),
    Order.find({ buyerId: user._id, state: { $lt: 0 } }),
    // Orders
    Order.countDocuments({ buyerId: user._id }),
    Order.countDocuments({ buyerId: user._id, orderState: 0 }),
    Order.countDocuments({ buyerId: user._id, orderState: 1 }),
    Order.countDocuments({ buyerId: user._id, orderState: 2 }),
    Order.countDocuments({ buyerId: user._id, orderState: 3 }),
    Order.countDocuments({ buyerId: user._id, orderState: 4 }),
    Order.countDocuments({ buyerId: user._id, orderState: { $lte: -1 } }),
    Order.countDocuments({ buyerId: user._id, orderState: -1 }),
    Order.countDocuments({ buyerId: user._id, orderState: -2 }),
    Order.countDocuments({ buyerId: user._id, orderState: -3 }),
    Order.countDocuments({ buyerId: user._id, orderState: -4 }),
    Order.countDocuments({ buyerId: user._id, orderState: -5 }),
  ])
  // Balance
  userData.pendingWithdrawals = pendingWithdrawals.reduce((acc, cur) => acc += cur.withdrawnAmount, 0)
  userData.WithdrawnBalance = WithdrawnBalance.reduce((acc, cur) => acc += cur.withdrawnAmount, 0)
  userData.profit = userData.AvailableBalance + userData.WithdrawnBalance;
  userData.pendingBalance = pendingBalance.reduce((acc, cur) => acc + cur.buyerCommission, 0)
  userData.cancelledBalance = cancelledBalance.reduce((acc, cur) => acc + cur.buyerCommission, 0)
  // Orders
  userData.allOrders = allOrders
  userData.ordersUnderReview = ordersUnderReview
  userData.ordersUnderProcess = ordersUnderProcess
  userData.ordersSentToShippingCompany = ordersSentToShippingCompany
  userData.ordersShipped = ordersShipped
  userData.ordersFinished = ordersFinished
  userData.cancelledOrders = cancelledOrders
  userData.cancelledOrdersByAdmin = cancelledOrdersByAdmin
  userData.cancelledOrdersBySeller = cancelledOrdersBySeller
  userData.cancelledOrdersByBuyer = cancelledOrdersByBuyer
  userData.cancelledOrdersByCustomer = cancelledOrdersByCustomer
  userData.returnedOrders = returnedOrders

  // console.log(data)
  // userData.allOrders = await Order.countDocuments({ buyerId: user._id });
  // userData.ordersUnderReview = await Order.countDocuments({ buyerId: user._id, orderState: 0 });
  // userData.ordersUnderProcess = await Order.countDocuments({ buyerId: user._id, orderState: 1 });
  // userData.ordersSentToShippingCompany = await Order.countDocuments({ buyerId: user._id, orderState: 2 });
  // userData.ordersShipped = await Order.countDocuments({ buyerId: user._id, orderState: 3 });
  // userData.ordersFinished = await Order.countDocuments({ buyerId: user._id, orderState: 4 });
  // userData.cancelledOrders = await Order.countDocuments({ buyerId: user._id, orderState: { $lte: -1 } });
  // userData.cancelledOrdersByAdmin = await Order.countDocuments({ buyerId: user._id, orderState: -1 });
  // userData.cancelledOrdersBySeller = await Order.countDocuments({ buyerId: user._id, orderState: -2 });
  // userData.cancelledOrdersByBuyer = await Order.countDocuments({ buyerId: user._id, orderState: -3 });
  // userData.cancelledOrdersByCustomer = await Order.countDocuments({ buyerId: user._id, orderState: -4 });
  // userData.returnedOrders = await Order.countDocuments({ buyerId: user._id, orderState: -5 });
  return userData;
}
const getSellerData = async (user) => {
  const userData = {}
  userData.user = { ...user._doc }
  // // orders
  // userData.allOrders = await Order.countDocuments({ sellerId: user._id });
  // userData.ordersUnderReview = await Order.countDocuments({ sellerId: user._id, orderState: 0 });
  // userData.ordersUnderProcess = await Order.countDocuments({ sellerId: user._id, orderState: 1 });
  // userData.ordersSentToShippingCompany = await Order.countDocuments({ sellerId: user._id, orderState: 2 });
  // userData.ordersShipped = await Order.countDocuments({ sellerId: user._id, orderState: 3 });
  // userData.ordersFinished = await Order.countDocuments({ sellerId: user._id, orderState: 4 });
  // userData.cancelledOrders = await Order.countDocuments({ sellerId: user._id, orderState: { $lte: -1 } });
  // userData.cancelledOrdersByAdmin = await Order.countDocuments({ sellerId: user._id, orderState: -1 });
  // userData.cancelledOrdersBySeller = await Order.countDocuments({ sellerId: user._id, orderState: -2 });
  // userData.cancelledOrdersByBuyer = await Order.countDocuments({ sellerId: user._id, orderState: -3 });
  // userData.cancelledOrdersByCustomer = await Order.countDocuments({ sellerId: user._id, orderState: -4 });
  // userData.returnedOrders = await Order.countDocuments({ sellerId: user._id, orderState: -5 });
  // userData.ratioOfFinishedOrdersToReturnedOrders = (userData.ordersFinished / (userData.ordersFinished + userData.returnedOrders)) * 100;
  // // products
  // userData.allProducts = await Product.countDocuments({ seller: user._id });
  // userData.totalStock = (await Product.find({ seller: user._id })).reduce((acc, cur) => acc + cur.total_amount, 0);
  const [
    // Orders
    allOrders,
    ordersUnderReview,
    ordersUnderProcess,
    ordersSentToShippingCompany,
    ordersShipped,
    ordersFinished,
    cancelledOrders,
    cancelledOrdersByAdmin,
    cancelledOrdersBySeller,
    cancelledOrdersByBuyer,
    cancelledOrdersByCustomer,
    returnedOrders,
    //Products
    allProducts,
    totalStock,

  ] = await Promise.all([
    // Orders
    Order.countDocuments({ sellerId: user._id }),
    Order.countDocuments({ sellerId: user._id, orderState: 0 }),
    Order.countDocuments({ sellerId: user._id, orderState: 1 }),
    Order.countDocuments({ sellerId: user._id, orderState: 2 }),
    Order.countDocuments({ sellerId: user._id, orderState: 3 }),
    Order.countDocuments({ sellerId: user._id, orderState: 4 }),
    Order.countDocuments({ sellerId: user._id, orderState: { $lte: -1 } }),
    Order.countDocuments({ sellerId: user._id, orderState: -1 }),
    Order.countDocuments({ sellerId: user._id, orderState: -2 }),
    Order.countDocuments({ sellerId: user._id, orderState: -3 }),
    Order.countDocuments({ sellerId: user._id, orderState: -4 }),
    Order.countDocuments({ sellerId: user._id, orderState: -5 }),
    // Products
    Product.countDocuments({ seller: user._id }),
    Product.find({ seller: user._id }),
  ])
  // Orders
  userData.allOrders = allOrders
  userData.ordersUnderReview = ordersUnderReview
  userData.ordersUnderProcess = ordersUnderProcess
  userData.ordersSentToShippingCompany = ordersSentToShippingCompany
  userData.ordersShipped = ordersShipped
  userData.ordersFinished = ordersFinished
  userData.cancelledOrders = cancelledOrders
  userData.cancelledOrdersByAdmin = cancelledOrdersByAdmin
  userData.cancelledOrdersBySeller = cancelledOrdersBySeller
  userData.cancelledOrdersByBuyer = cancelledOrdersByBuyer
  userData.cancelledOrdersByCustomer = cancelledOrdersByCustomer
  userData.returnedOrders = returnedOrders
  userData.ratioOfFinishedOrdersToReturnedOrders = (userData.ordersFinished / (userData.ordersFinished + userData.returnedOrders)) * 100;
  // Products
  userData.allProducts = allProducts
  userData.totalStock = totalStock.reduce((acc, cur) => acc + cur.total_amount, 0)
  // user.totalStock = 
  return userData;
}
const login = async (req, res, next) => {
  try {
    const user = await User.Login(req.body.email, req.body.password);
    const token = await user.generateToken();
    let newUserForm;
    if (user.role === 'buyer')
      newUserForm = await getBuyerData(user);
    if (user.role === 'seller')
      newUserForm = await getSellerData(user);
    res.json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: newUserForm,
      token,
    });
  } catch (e) {
    e.statusCode = 401;
    next(e);
    // next(ServerError.badRequest(401, e.message))
    // res.status(401).send(e.message);
  }
};
const updateUser = async (req, res, next) => {
  try {
    // console.log(req.body.password);
    const updates = Object.keys(req.body);
    const notAllowedUpdates = ['status', 'role', 'tokens', 'balance', 'password', 'updatedAt', '_id', 'createdAt', 'resetLink',];
    // const isValid = updates.every(el => !notAllowedUpdates.includes(el));
    const inValidUpdates = updates.filter(el => notAllowedUpdates.includes(el))
    // console.log(inValidUpdates)
    // console.log(isValid);
    // console.log(updates);
    if (inValidUpdates.length > 0) {
      return next(ServerError.badRequest(401, `not allowed to update (${inValidUpdates.join(', ')})`))
      // return res.status(400).send("Can't update");
    }
    // console.log(req.user);
    // console.log(req.body.password);
    // const validation = await validatePassword(req.user, req.body.oldpassword);
    // console.log(validation);
    // if (!validation) throw new Error('wrong password');
    // updates.forEach((update) => {
    //   req.user[update] = req.body[update];
    // });
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    })
    // console.log(req.body)
    if (req.file) user.image = req.file.filename;
    await user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: user,
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const addMoreDataToOrder = async (orders) => {
  const newOrders = [];
  for (const el of orders) {
    const product = await Product.findById({ _id: el.productId }, {
      reviews: 0,
      originalPrice: 0
    });
    const newOrderForm = { ...el._doc };
    newOrderForm.OrderedProduct = product;
    newOrderForm.OrderedProperties = el.orderItems.map(orderProperty => {
      const propertiesNewForm = product.properties.find(property => property._id.toString() === orderProperty.propertyId.toString());
      propertiesNewForm.amount = orderProperty.quantity;
      return propertiesNewForm;
    })
    newOrders.push(newOrderForm)
  }
  return newOrders;
}
const getSellerOrders = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    if (user.role !== 'seller') {
      return next(ServerError.badRequest(401, "not authorized"));
    }
    const orders = await ApiFeatures.pagination(
      Order.find({ sellerId: user._id }, {
        productId: 1,
        orderItems: 1,
        totalPrice: 1,
        name: 1,
        phone: 1,
        city: 1,
        area: 1,
        address: 1,
        subAddress: 1,
        shippingPrice: 1,
        storeName: 1,
        comment: 1,
        orderState: 1,
        createdAt: 1
      }, { orderState: { $ne: 0 } })
      , req.query)
    const ordersNewForm = await addMoreDataToOrder(orders);
    // console.log(ordersNewForm)
    const totalLength = await Order.countDocuments({ sellerId: user._id })
    // await req.user.populate('sellerOrders', {
    // productId: 1,
    //   orderItems: 1,
    //   totalPrice: 1,
    //   name: 1,
    //   phone: 1,
    //   city: 1,
    //   area: 1,
    //   address: 1,
    //   subAddress: 1,
    //   shippingPrice: 1,
    //   storeName: 1,
    //   comment: 1,
    //   orderState: 1,
    //   createdAt: 1
    // }, { orderState: { $ne: 0 } }
    // )
    // const allOrders = req.user.sellerOrders; // all orders
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: ordersNewForm,
      totalLength
    })
  } catch (e) {
    next(e)
  }
}

const getBuyerOrders = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    if (user.role !== 'buyer') {
      return next(ServerError.badRequest(401, "not authorized"));
    }

    const orders = await ApiFeatures.pagination(
      Order.find({ buyerId: user._id }, {
        productId: 1,
        orderItems: 1,
        totalPrice: 1,
        name: 1,
        phone: 1,
        city: 1,
        area: 1,
        address: 1,
        subAddress: 1,
        shippingPrice: 1,
        storeName: 1,
        comment: 1,
        orderState: 1,
        createdAt: 1,
        buyerCommission: 1,
        sellPrice: 1,
        newPrice: 1,
      }), req.query
    )
    const ordersNewForm = await addMoreDataToOrder(orders);
    // console.log(ordersNewForm)
    const totalLength = await Order.countDocuments({ buyerId: user._id })
    // const allOrders = req.user.buyerOrders; // all orders
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: ordersNewForm,
      totalLength
    })
  } catch (e) {
    next(e)
  }
}
const getBuyerOrderById = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    if (user.role !== 'buyer') {
      return next(ServerError.badRequest(401, "not authorized"));
    }
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.findOne({ _id: id, buyerId: user._id }, {
      productId: 1,
      orderItems: 1,
      totalPrice: 1,
      name: 1,
      phone: 1,
      city: 1,
      area: 1,
      address: 1,
      subAddress: 1,
      shippingPrice: 1,
      storeName: 1,
      comment: 1,
      orderState: 1,
      createdAt: 1,
      buyerCommission: 1,
      sellPrice: 1,
      newPrice: 1,
    })
    if (!order)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const OrderedProduct = await Product.findById({ _id: order.productId }, {
      reviews: 0,
      originalPrice: 0
    });
    const OrderedProperties = order.orderItems.map(orderProperty => OrderedProduct.properties.find(property => property._id.toString() === orderProperty.propertyId.toString()))
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: {
        order,
        OrderedProduct,
        OrderedProperties
      }
    })
  } catch (e) {
    next(e);
  }
}
const getUserInfo = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: user
    })
  } catch (e) {
    next(e);
  }
}
const getUser = async (req, res, next) => {
  try {
    // const userId = req.params.id
    // if (!userId)
    //   return next(ServerError.badRequest(400, 'please send id'))
    // const user = await User.User.findById(userId)
    // if (!user) {
    //   return next(ServerError.badRequest(400, 'unable to find any user match this ID'))
    // }
    if (!req.user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    // await req.user.populate('orders', { buyerCommission: 1, createdAt: 1, orderState: 1 })
    // console.log(userOrders)
    // const withdrawnProfit = [];
    // const balanceUnderReview = [];
    // req.user.orders.forEach(el => {
    // if (el.orderState === 0 || el.orderState === 1 || el.orderState === 2 || el.orderState === 3)
    // balanceUnderReview.push({
    // buyerCommission: el.buyerCommission,
    // orderCreationDate: el.createdAt,
    //       orderId: el._id,
    //     })
    //   if (el.orderState === 4)
    //     withdrawnProfit.push({
    //       buyerCommission: el.buyerCommission,
    //       orderCreationDate: el.createdAt,
    //       orderId: el._id,
    //     })
    // })
    // }
    console.log(1)
    const user = req.user;
    let newUserForm;
    if (user.role === 'buyer')
      newUserForm = await getBuyerData(user);
    if (user.role === 'seller')
      newUserForm = await getSellerData(user);

    // await req.user.populate('sellerOrders')
    // console.log(req.user.sellerOrders)
    // const sellerData = {};
    // if (user.role === 'seller') {
    //   await user.populate('sellerOrders', {
    //     productId: 1,
    //     orderItems: 1,
    //     totalPrice: 1,
    //     name: 1,
    //     phone: 1,
    //     city: 1,
    //     area: 1,
    //     address: 1,
    //     subAddress: 1,
    //     shippingPrice: 1,
    //     storeName: 1,
    //     comment: 1,
    //     orderState: 1,
    //     createdAt: 1
    //   }, { orderState: { $ne: 0 } }
    //   )
    //   sellerData.allOrders = req.user.sellerOrders; // all orders
    //   sellerData.finishedOrders = req.user.sellerOrders.filter(el => el.orderState === 4); // succeeded orders
    //   sellerData.OrdersReturned = req.user.sellerOrders.filter(el => el.orderState === -5); // Returned orders
    //   sellerData.OrdersCancelledByCustomer = req.user.sellerOrders.filter(el => el.orderState === -4); // Cancelled orders by Customer
    //   sellerData.OrdersCancelledByBuyer = req.user.sellerOrders.filter(el => el.orderState === -3); // Cancelled orders by Buyer
    //   sellerData.OrdersCancelledByYou = req.user.sellerOrders.filter(el => el.orderState === -2); // Cancelled orders by you



    // sellerData.OrdersCancelledByAdmin = req.user.sellerOrders.filter(el => el.orderState === -1); // Cancelled orders by admin



    // .find({ orderState: { $get: 1, $lte: -1 } })
    // console.log(req.user.orders)
    // }
    // return res.status(200).send(req.user.orders)
    // console.log(req.user)
    // console.log(_doc);
    // const { _doc } = req.user

    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: newUserForm
      // ...req.user.lean(),
      // ..._doc,
      // ...sellerData
      // withdrawnProfit,
      // balanceUnderReview
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status.apply(500).send(e.message);
  }
};
const changePassword = async (req, res, next) => {
  try {
    if (!req.user)
      return next(ServerError.badRequest(400, "token is not valid"));
    const user = req.user;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    if (password === newPassword)
      return next(ServerError.badRequest(400, "old and new password are same"));
    const isMatched = await user.validatePassword(password);
    if (!isMatched)
      return next(ServerError.badRequest(400, "wrong password"));
    user.password = newPassword;
    await user.save()
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'password has been updated successfully',
    })
  } catch (e) {
    // next(ServerError.badRequest(500, e.message))
    next(e)
    // res.status.apply(500).send(e.message);
  }
};


const getAll = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: users,
    })
  } catch (e) {
    // next(ServerError.badRequest(500, e.message))
    next(e)
    // res.status.apply(500).send(e.message);
  }
};
const getAllBuyers = async (req, res, next) => {
  try {
    const buyers = await User.find({ role: 'buyer' });
    // const buyers = user.filter((el) => {
    // return el.role == 'buyer';
    // });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: buyers,
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};

const getAllSellers = async (req, res, next) => {
  try {
    const sellers = await User.find({ role: 'seller' });
    // const seller = user.filter((el) => {
    // return el.role == 'seller';
    // });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: sellers,
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetLink = req.params.token
    const newPassword = req.body.password
    if (!newPassword) {
      return next(ServerError.badRequest(401, 'please send password'))
    }
    if (resetLink) {
      jwt.verify(resetLink, 'resetPassword', async function (err, decoded) {
        if (err) {
          return next(ServerError.badRequest(401, 'token is not correct'))
        }
        const user = await User.findOne({ resetLink: resetLink })
        if (!user) {
          return next(ServerError.badRequest(401, 'token is not correct'))
        }
        await user.updateOne({ password: newPassword }, {
          new: true,
          runValidators: true,
        }, async (err, data) => {
          if (err) {
            return next(ServerError.badRequest(401, e.message))
          }
          else if (data) {
            console.log(user.password)
            console.log()
            user.password = newPassword;
            user.resetLink = ''
            await user.save()
            res.json(
              {
                ok: true,
                code: 200,
                message: 'succeeded',
                data: 'your password is successfully changed'
              }
            )
          }
        })
      })
    }
    else {
      return next(ServerError.badRequest(401, 'Authentication error!'))
    }
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
}


// router.put('/user/forgetpass', async (req, res,next) => {
const forgetPassword = async (req, res, next) => {
  try {
    const email = req.body.email
    const url = 'http://localhost:3000'
    const user = User.findOne({ email }, (err, user) => {
      if (err || !user) {
        // return res.status(404).send('user with this email dose not exist')
        return next(ServerError.badRequest(400, 'no user found with this email'))
      }
      const token = jwt.sign({ _id: user._id }, 'resetPassword', { expiresIn: '20m' })
      // const SENDGRID_API_KEY = "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"
      // const SENDGRID_API_KEY = "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"
      sendgrid.setApiKey(sendgridApiKey)
      const data = {
        to: email,
        from: sendgridEmail,
        subject: 'Account reset password Link',
        html: ` <h2>Please click on given Link to reset your password</h2>  
                    <p> ${url}/api/v1/users/auth/reset-password/${token} </p> 
              `
      }
      user.updateOne({ resetLink: token }, function (err, success) {
        if (err) {
          return next(ServerError.badRequest(400, 'something went wrong'))
          // return res.status(400).json({ err: 'reset password link error' })
        }
        else {
          sendgrid.send(data)
            .then((response) => {
              res.status(200).json({
                ok: true,
                code: 200,
                message: 'succeeded',
                body: 'email has been sent',
              })
            })
            .catch((err) => {
              return next(ServerError.badRequest(400, err.message))
              // res.json(error.message)
            })
        }
      })
    })
  }
  catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
}


const logout = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((el) => {
      return el != req.token;
    });
    await req.user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const logoutAll = async (req, res, next) => {
  try {
    console.log(req.user);
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    })
  } catch (e) {
    // e.statusCode = 400
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // console.log(e);
    // res.status(500).send(e);
  }
};


const getBuyerWithdrawals = async (req, res, next) => {
  try {
    const user = req.user
    if (user.role !== 'buyer')
      return next(ServerError.badRequest(401, 'not authorized'));
    // user.populate('buyerWithdrawals');

    const withdrawals = await ApiFeatures.pagination(
      Withdrawal.find({ buyerId: req.user._id }).sort({ createdAt: -1 }), req.query
    )
    const totalLength = await Withdrawal.countDocuments({ buyerId: req.user._id });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
      totalLength,
    })
    // req.query
    // )
  } catch (e) {
    next(e)
  }
}
const getUserBalance = async (req, res, next) => {
  const user = req.user
  if (user.role !== 'buyer')
    return next(ServerError.badRequest(401, 'not authorized'));
  const balance = await User.findById({ _id: user._id }, { balance: 1, _id: 0 });
  res.status(200).json({
    ok: true,
    code: 200,
    message: 'succeeded',
    data: balance,

  })
}
const getLatestWithdrawals = async (req, res, next) => {
  try {
    const user = req.user
    if (user.role !== 'buyer')
      return next(ServerError.badRequest(401, 'not authorized'));
    const withdrawals = await Withdrawal.find({ buyerId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
    })
  } catch (e) {
    next(e)
  }
}
module.exports = {
  signup,
  getUser,
  getUserInfo,
  login,
  logout,
  logoutAll,
  changePassword,
  getAll,
  getAllBuyers,
  getAllSellers,
  updateUser,
  resetPassword,
  forgetPassword,
  Uploads,
  getBuyerOrderById,
  getSellerOrders,
  getBuyerOrders,
  getBuyerWithdrawals,
  getUserBalance,
  getLatestWithdrawals
};
