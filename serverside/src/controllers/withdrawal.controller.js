const { User } = require('../model/user')
const ServerError = require('../interface/Error');
const Withdrawal = require('../model/withdrawal');

const create = async (req, res, next) => {
  try {
    const user = req.user;
    const withdrawnAmount = req.body.withdrawnAmount;
    if (!withdrawnAmount)
      return next(ServerError.badRequest(400, 'you must enter withdrawn amount'))
    if (user.role !== 'buyer')
      return next(ServerError.badRequest(401, 'not authorized'))
    if (user.status !== 'active')
      return next(ServerError.badRequest(401, 'not authorized you are blocked'))
    if (user.balance < withdrawnAmount)
      return next(ServerError.badRequest(400, 'you do not have enough balance'))
    if (withdrawnAmount < 100)
      return next(ServerError.badRequest(400, 'you must withdraw at least 100 LE'))
    if (!user.payment_method_number || !user.payment_method)
      return next(ServerError.badRequest(400, 'please add payment method first'))
    const withdrawal = new Withdrawal({
      buyerId: user._id,
      withdrawnAmount,
      totalBalance: user.balance,
      balanceAfterWithdrawn: user.balance - withdrawnAmount,
      payment_method: user.payment_method,
      payment_method_number: user.payment_method_number
    })
    user.balance -= withdrawnAmount;
    await user.save();
    await withdrawal.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: withdrawal
    })
  } catch (e) {
    next(e);
  }
}


module.exports = {
  create
}