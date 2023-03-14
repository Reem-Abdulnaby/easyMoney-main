const Order = require('../model/order')
const { User } = require('../model/user')
const Product = require('../model/product')
const ServerError = require('../interface/Error')
const ApiFeatures = require('../utils/ApiFeatures');

const createOrder = async (req, res, next) => {
  try {
    if (req.user.role !== 'buyer' && req.user.status !== 'active') {
      return next(ServerError.badRequest(403, 'not authorized'))
    }
    if (req.body.newPrice <= req.body.sellPrice) {
      return next(ServerError.badRequest(400, 'new price must be greater than sell price'))
    }
    const productId = req.body.productId
    const product = await Product.findById({ _id: productId })
    if (!product)
      return next(ServerError.badRequest(400, 'invalid product id'))
    if (product.status !== 1)
      return next(ServerError.badRequest(400, 'can not buy this product because it is not active'))
    if (!product.sellPrice)
      return next(ServerError.badRequest(400, 'can not buy this product because it is not active and do not have sell price yet'))
    if (req.body.sellPrice !== product.sellPrice)
      return next(ServerError.badRequest(400, 'sellPrice is wrong'))
    //check if product seller is active or no
    const seller = await User.findById({ _id: product.seller });
    if (seller.status !== 'active')
      return next(ServerError.badRequest(400, 'can not buy this product because its seller is blocked'))
    // const ordersProperties = product.properties.filter(el => el._id.toString() === req.body.orderItems[0].propertyId)
    const validateQuantity = req?.body?.orderItems?.every(el => el.quantity > 0)
    if (!validateQuantity)
      return next(ServerError.badRequest(400, 'quantity must be positive number'))

    let checkForProperties = 0;
    let checkForStock = 0;
    req?.body?.orderItems?.forEach(orderItem => {
      console.log(orderItem.propertyId)
      const checker = product.properties.find(el => el?._id?.toString() === orderItem?.propertyId)
      const stockChecker = product.properties.find(el => el?._id?.toString() === orderItem?.propertyId && el.amount >= orderItem.quantity)
      // console.log
      if (checker)
        checkForProperties++;
      if (stockChecker)
        checkForStock++;
    })
    console.log(checkForProperties)
    if (checkForProperties !== req.body.orderItems.length)
      return next(ServerError.badRequest(400, 'invalid property id'))
    if (checkForStock !== req.body.orderItems.length)
      return next(ServerError.badRequest(400, 'stock is low'))

    const orderQuantity = req.body.orderItems.reduce((acc, cur) => cur.quantity + acc, 0)
    console.log(orderQuantity)
    const shippingPrice = product.shipping_price[req.body.city]
    const totalPrice = (req.body.newPrice * orderQuantity) + shippingPrice;
    console.log(totalPrice)
    // console.log(totalPrice);
    // console.log(req.body.totalPrice);
    if (req.body.shippingPrice !== shippingPrice)
      return next(ServerError.badRequest(400, 'invalid shipping price'))
    if (req.body.totalPrice !== totalPrice)
      return next(ServerError.badRequest(400, 'invalid total price'))
    const order = new Order({
      ...req.body,
      sellerId: product.seller,
      buyerId: req.user._id,
      shippingPrice,
      totalPrice,
      websiteTax: (product.sellPrice - product.originalPrice) * orderQuantity,
      buyerCommission: (req.body.newPrice - product.sellPrice) * orderQuantity,
    })
    await order.save()
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: order
    })
  } catch (e) {
    next(e)
  }
}

// Todo calc totalPrice quantity * price
const confirmOder = async (order, req, res, next) => {
  try {
    order.orderState = 1;
    const product = await Product.findById({ _id: order.productId })
    let checkStockError = false
    order.orderItems.forEach(async item => {
      // get property
      const elIndex = product.properties.findIndex(el => el._id.toString() === item.propertyId.toString());
      //check for Stock First
      if (product.properties[elIndex].amount < item.quantity)
        checkStockError = true
      // decrease stock
      product.properties[elIndex].amount -= item.quantity;
    })
    if (checkStockError)
      return next(ServerError.badRequest(400, 'stock is low cancel the or try again later'))
    console.log(product)
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount
    }, 0)
    product.total_amount = sum;
    await product.save();
    await order.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order
    })
  } catch (e) {
    next(e);
  }
}
const cancelOrder = async (order, req, res, next) => {
  try {
    const product = await Product.findById({ _id: order.productId })
    order.orderItems.forEach(async item => {
      // get property
      const elIndex = product.properties.findIndex(el => el._id.toString() === item.propertyId.toString());
      // decrease stock
      product.properties[elIndex].amount += item.quantity;
    })
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount
    }, 0)
    product.total_amount = sum;
    await product.save()
    await order.save()
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order
    })
  } catch (e) {
    next(e);
  }
}
const updateOrder = async (req, res, next) => {
  try {
    if (req.user.status !== 'active') {
      return next(ServerError.badRequest(403, 'not authorized'));
    }
    const orderId = req.params.id;
    if (!orderId || orderId.length < 24)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.findById({ _id: orderId });
    if (!order)
      return next(ServerError.badRequest(400, 'order id not valid'));
    if (order.orderState === 4) {
      return next(ServerError.badRequest(400, 'order can not modified after it is finished'));
    }
    const orderState = req.body.orderState;
    if (order.orderState === 0 && orderState > 1) {
      return next(ServerError.badRequest(400, 'order must be confirmed first'));
    }
    if (!orderState)
      return next(ServerError.badRequest(400, 'please put orderState in body'));
    if (![-4, -3, -2, 2, 3].includes(orderState))
      return next(ServerError.badRequest(400, 'orderState is not in valid range'));
    if (orderState === -3) {
      if (req.user.role !== 'buyer') {
        return next(ServerError.badRequest(403, 'not authorized'));
      }
      if (order.orderState !== 0) {
        return next(ServerError.badRequest(403, 'you can not cancel the order after it is confirmed'));
      }
    } // ask for it
    if ([-4, -2, 2, 3].includes(orderState))
      if (req.user.role !== 'seller') {
        return next(ServerError.badRequest(403, 'not authorized'));
      }
    if ([-5, -1, 1, 0, 4].includes(orderState))
      return next(ServerError.badRequest(403, 'not authorized'));

    if (order.orderState >= orderState && orderState >= 0)
      return next(ServerError.badRequest(400, 'you cannot downgrade orderState step except you canceling it '));
    if (order.orderState < 0)
      return next(ServerError.badRequest(400, 'order is already canceled you cannot change anything in it'));
    if (orderState === 1)
      return await confirmOder(order, req, res, next);
    if (orderState === 2) {
      order.orderState = orderState;
      await order.save();
    }
    if (orderState === 3) {
      order.orderState = orderState;
      await order.save();
    }
    if ([-4, -3, -2].includes(orderState)) {
      if (order.orderState === 0) {
        order.orderState = orderState;
        order.save();
      } else {
        order.orderState = orderState;
        return await cancelOrder(order, req, res, next);
      }
      // order.save();
    }
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order
    })
  } catch (e) {
    next(e);
  }
}


const getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!orderId || orderId.length < 24)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.findById({ _id: orderId });
    if (!order)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const product = await Product.findById({ _id: order.productId })
    console.log(product)
    // if (req.user.role === 'seller') {
    //   console.log(req.user._id)
    //   console.log(order.seller)
    //   if (req.user._id.toString() !== order.sellerId.toString())
    //     return next(ServerError.badRequest(403, 'not authorized'));
    // }
    if (req.user.role === 'buyer') {
      if (req.user._id.toString() !== order.buyerId.toString())
        return next(ServerError.badRequest(403, 'not authorized'));
    }
    const newOrderForm = { _id, buyerId } = order;
    res.status(200).json({
      data: newOrderForm
    })
  } catch (e) {
    next(e);
  }
}

module.exports = { createOrder, updateOrder, getOrder }