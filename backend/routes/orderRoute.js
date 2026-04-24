import express from 'express'
import {placeOrder,placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus, verifyStripe, verifyRazorpay, deleteOrder, deleteAllOrders} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
const orderRouter = express.Router()
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/delete', adminAuth, deleteOrder)
orderRouter.post('/deleteall', adminAuth, deleteAllOrders)
orderRouter.post('/status', adminAuth, updateStatus)

orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

orderRouter.post('/userorders',authUser,userOrders)
orderRouter.post('/verifystripe',authUser,verifyStripe)
orderRouter.post('/verifyRazorpay',authUser,verifyRazorpay)

export default orderRouter