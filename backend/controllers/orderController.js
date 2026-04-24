import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import Stripe from 'stripe'
import razorpay from 'razorpay'


const currency='pkr'
const deliveryCharge=10

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance=new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

// Attach vendorId to each order item from the products collection
const attachVendorIds = async (items) => {
    const productIds = items.map(i => i._id).filter(Boolean)
    const products = await productModel.find({ _id: { $in: productIds } }, '_id vendorId')
    const vendorMap = {}
    products.forEach(p => { vendorMap[p._id.toString()] = p.vendorId })
    return items.map(item => ({ ...item, vendorId: vendorMap[item._id] || null }))
}

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body
        const itemsWithVendor = await attachVendorIds(items)
        const orderData = {
            userId,
            items: itemsWithVendor,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })
        res.json({ success: true, message: "Order Placed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body
        const { origin } = req.headers
        const itemsWithVendor = await attachVendorIds(items)
        const orderData = {
            userId,
            items: itemsWithVendor,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()
        
      const line_items= items.map((item)=>({
            price_data:{
                currency:currency,
                product_data:{
                   name:item.name 
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))

        line_items.push({
             price_data:{
                currency:currency,
                product_data:{
                   name:"Delivery Charges" 
                },
                unit_amount:deliveryCharge*100
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            success_url:`${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode:'payment'
        })

        res.json({success:true,session_url:session.url})

    } catch (error) {
 console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req,res)=>{
    const {orderId,success,userId}= req.body
try {
     if (success=="true") {
        await orderModel.findByIdAndUpdate(orderId,{payment:true})
        await userModel.findByIdAndUpdate(userId,{cartData:{}})
        res.json({success:true})
    }
    else{
        await orderModel.findByIdAndDelete(orderId)
        res.json({success:false})
    }
} catch (error) {
     console.log(error)
        res.json({ success: false, message: error.message })
}
   
}

const placeOrderRazorpay = async (req, res) => {
try {
            const { userId, items, amount, address } = req.body
        const itemsWithVendor = await attachVendorIds(items)
        const orderData = {
            userId,
            items: itemsWithVendor,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount:amount*100,
            currency:currency.toUpperCase(),
            receipt:newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options,(error,order)=>{
if (error) {
    console.log(error)
    return res.json({success:false,message:error})
}
res.json({success:true,order})
        })
} catch (error) {
     console.log(error)
        res.json({ success: false, message: error.message })
}
}
const allOrders = async (req, res) => {
    try {
        const { vendorFilter } = req.query
        const user = req.user

        let orders = await orderModel.find({})

        if (user && user.role === 'vendor') {
            // Vendor sees only orders that contain at least one of their products
            const vendorId = user._id.toString()
            orders = orders.filter(order =>
                order.items.some(item => item.vendorId === vendorId)
            ).map(order => ({
                ...order.toObject(),
                items: order.items.filter(item => item.vendorId === vendorId)
            }))
        } else if (vendorFilter && vendorFilter !== 'all') {
            // Admin filtering by specific vendor
            orders = orders.filter(order =>
                order.items.some(item => item.vendorId === vendorFilter)
            ).map(order => ({
                ...order.toObject(),
                items: order.items.filter(item => item.vendorId === vendorFilter)
            }))
        }

        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyRazorpay= async (req,res)=>{
    try {
        const {userId,razorpay_order_id}=req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status==='paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            res.json({success:true,message:"Payment Successful"})
        } else{
            res.json({success:false,message:'Payment Failed'})
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        await orderModel.findByIdAndDelete(orderId)
        res.json({ success: true, message: 'Order deleted' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deleteAllOrders = async (req, res) => {
    try {
        await orderModel.deleteMany({})
        res.json({ success: true, message: 'All orders deleted' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { verifyRazorpay, placeOrder, verifyStripe, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, deleteOrder, deleteAllOrders }