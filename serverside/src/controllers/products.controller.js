const multer = require('multer');
const Product = require('../model/product');
const auth = require('../middleware/auh');
const User = require('../model/user');
const ServerError = require('../interface/Error');
const ApiFeatures = require('../utils/ApiFeatures');

const Uploads = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
      return cb(new Error('please upload image !'));
    cb(null, true);
  },
});

const getProductStatus = async (req,res,next) =>{
  try {
    const productStatus = await Product.aggregate([
      {
        $group : {
          _id : { $month : '$createdAt'},
          products : {$sum : 1},
        }
      },
      {
        $addFields : {
          month : '$_id'
        }
      },
      {
        $project : {
          _id : 0
        }
      },
      {
        $sort : {month : 1}
      },
    ])
    const status = Array(12).fill(0);
    productStatus.forEach(el => {
      status[el.month - 1]  = el.products;
    })
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: status,
    });
  } catch (e) {
    next(e)
  }
}
const createProduct = async (req, res, next) => {
  try {
    if (req.user.role != 'seller') {
      return next(ServerError.badRequest(403, 'Error, Must be seller to add product'))
      // throw new Error('Error, Must be seller to add product');
    }
    const keys = Object.keys(req.body);
    const notAllowed = ['_id', 'rate', 'sellPrice', 'numOfReviews', 'reviews', 'updatedAt', 'createdAt', 'status',];
    const inValid = keys.filter(el => notAllowed.includes(el));
    if (inValid.length > 0) {
      next(ServerError.badRequest(401, `not allowed to insert (${inValidUpdates.join(', ')})`))
    }
    const product = new Product({ ...req.body, seller: req.user._id });
    if (req.file) {
      product.image = req.file.filename;
    }
    const sum = product.properties.reduce((accumulator, object) => {
      return accumulator + object.amount;
    }, 0);
    product.total_amount = sum;
    await product.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      body: product,
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};

const getAll = async (req, res, next) => {
  try {
    // const products = await Product.find({});
    const products = await ApiFeatures.pagination(Product.find({
      status: 1
    }), req.query)
    // const test = await Product.updateMany({}, { image: [] }); // update many
    const totalLength = await Product.countDocuments({status: 1});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: products,
      totalLength,
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status.status(500).send(e.message);
  }
};
const getAllCat = async (req, res, next) => {
  try {
    const categories = [];
    const product = await Product.find({});
    product.forEach((el) => {
      if (!categories.includes(el.category)) categories.push(el.category);
    });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: categories,
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById({ _id: id });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: product,
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const getProductsByCategory = async (req, res, next) => {
  try {
    const catName = req.params.category;
    const products = await ApiFeatures.pagination(Product.find({ category: new RegExp(catName, 'i') ,status: 1})
      , req.query)
    // const products = await Product.find({ category: new RegExp(catName, 'i') });
    const totalLength = await Product.countDocuments({ category: new RegExp(catName, 'i') ,status: 1})

    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: products,
      totalLength
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const getProductsByName = async (req, res, next) => {
  try {
    const productName = req.params.name;
    // old way
    // const product = await Product.find({ name: productName });

    // const products = await Product.find({ name: { $regex: new RegExp(productName, "i") } });
    const products = await ApiFeatures.pagination(
      Product.find({ name: { $regex: new RegExp(productName, "i") } , status: 1}),
      req.query)
    const totalLength = await Product.countDocuments({ name: { $regex: new RegExp(productName, "i")} ,status: 1 })
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: products,
      totalLength
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const getProductsBySellerID = async (req, res, next) => {
  try {
    const sellerId = req.params.seller;
    console.log(req.params)
    // const products = await Product.find({ seller: sellerId });
    const products = await ApiFeatures.pagination(
      Product.find({ seller: sellerId ,status: 1}),
      req.query)
    const totalLength = await Product.countDocuments({ seller: sellerId })
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: products,
      totalLength
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    // if (req.user.id  !== product)
    // return next(ServerError.badRequest(400, 'sellerId cannot update!'))
    // throw new Error('sellerId cannot update!'); 
    const keys = Object.keys(req.body);
    const notAllowed = ['_id', 'rate', 'sellPrice', 'numOfReviews', 'reviews', 'updatedAt', 'createdAt', 'status',];
    const inValid = keys.filter(el => notAllowed.includes(el));
    if (inValid.length > 0) {
      return next(ServerError.badRequest(401, `not allowed to update (${inValidUpdates.join(', ')})`))
    }
    const product = await Product.findOne(
      { _id: productId, seller: req.user._id }
    );
    
    if (!product) {
      return next(ServerError.badRequest(400, 'product not found'))
      // throw new Error('cannot find product')
    }
    //check if price changed
    if(req.body.originalPrice !== product.originalPrice){
      product.status = 0;
    }
    //update product
    product.update(
      req.body,
      {
        new: true,
        runValidators: true,
      })
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount
    }, 0)
    product.total_amount = sum;
    // if (req.file) {
    //   product.image = req.file.filename;
    // }
    await product.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: product,
    });
  } catch (e) {
    console.log(e)
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({
      _id: productId,
      seller: req.user._id,
    });
    if (!product)
      return next(ServerError.badRequest(400, 'invalid id'))
    product.status = -2;
    await product.save()
    // throw new Error('Invalid ID')
    // await Product.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
const sellerGetOwn = async (req, res, next) => {
  try {
    const products = await ApiFeatures.pagination(Product.find({
      seller: req.user._id
    }), req.query)
    const totalLength = await Product.countDocuments({ seller: req.user._id });
    res.status(200).json({
      status: 200,
      message: 'succeeded',
      data: products,
      totalLength
    });
  } catch (e) {
    next(e)
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message);
  }
};
module.exports = {
  getProductStatus,
  createProduct,
  getAll,
  getAllCat,
  getProductById,
  getProductsByCategory,
  getProductsByName,
  getProductsBySellerID,
  updateProduct,
  deleteProduct,
  sellerGetOwn,
  Uploads,
};
