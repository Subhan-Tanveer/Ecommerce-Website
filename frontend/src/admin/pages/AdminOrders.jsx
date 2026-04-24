import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'

const statusColors = {
  'Order Placed': 'bg-blue-50 text-blue-700',
  'Packing': 'bg-yellow-50 text-yellow-700',
  'Shipped': 'bg-purple-50 text-purple-700',
  'Out for delivery': 'bg-orange-50 text-orange-700',
  'Delivered': 'bg-green-50 text-green-700',
}

const AdminOrders = ({ permissions = {} }) => {
  const { backendUrl, token } = useContext(ShopContext)
  const { isAdmin } = permissions
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [vendorFilter, setVendorFilter] = useState('all')

  const fmt = (price) => 'Rs ' + new Intl.NumberFormat('en-PK').format(price)

  const fetchAllOrders = async (filter = vendorFilter) => {
    if (!token) return
    try {
      const url = filter && filter !== 'all'
        ? `${backendUrl}/api/order/list?vendorFilter=${filter}`
        : `${backendUrl}/api/order/list`
      const response = await axios.post(url, {}, { headers: { token } })
      if (response.data.success) setOrders(response.data.orders.reverse())
      else toast.error(response.data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/user/all', { headers: { token } })
      if (res.data.success) setVendors(res.data.users.filter(u => u.role === 'vendor'))
    } catch {}
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Status updated')
        fetchAllOrders()
      } else toast.error(response.data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return
    try {
      const response = await axios.post(backendUrl + '/api/order/delete', { orderId }, { headers: { token } })
      if (response.data.success) { toast.success('Order deleted'); fetchAllOrders() }
      else toast.error(response.data.message)
    } catch (error) { toast.error(error.message) }
  }

  const deleteAllOrders = async () => {
    if (!window.confirm('Are you sure you want to delete ALL orders? This cannot be undone.')) return
    try {
      const response = await axios.post(backendUrl + '/api/order/deleteall', {}, { headers: { token } })
      if (response.data.success) { toast.success('All orders deleted'); fetchAllOrders() }
      else toast.error(response.data.message)
    } catch (error) { toast.error(error.message) }
  }

  useEffect(() => {
    fetchAllOrders()
    if (isAdmin) fetchVendors()
  }, [token])

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
          <p className='text-sm text-gray-500 mt-1'>{orders.length} total orders</p>
        </div>
        <div className='flex items-center gap-3'>
          {isAdmin && vendors.length > 0 && (
            <select
              value={vendorFilter}
              onChange={(e) => { setVendorFilter(e.target.value); fetchAllOrders(e.target.value) }}
              className='px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 bg-white'
            >
              <option value='all'>All Vendors</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
              ))}
            </select>
          )}
        <button
          onClick={deleteAllOrders}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-all'
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
        <button
          onClick={fetchAllOrders}
          className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all'
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        </div>
      </div>

      {orders.length === 0 && (
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400'>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className='text-sm font-medium'>No orders yet</p>
        </div>
      )}

      <div className='flex flex-col gap-4'>
        {orders.map((order, index) => (
          <div key={index} className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <div className='flex flex-col lg:flex-row lg:items-start gap-6'>

              {/* Order Items */}
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className='text-xs text-gray-400'>{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  {order.items.map((item, i) => (
                    <p key={i} className='text-sm text-gray-700'>
                      <span className='font-medium'>{item.name}</span>
                      <span className='text-gray-400'> × {item.quantity}</span>
                      <span className='ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded'>{item.size}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className='lg:w-52'>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Customer</p>
                <p className='text-sm font-semibold text-gray-800'>{order.address.firstName} {order.address.lastName}</p>
                <p className='text-xs text-gray-500 mt-1'>{order.address.street}</p>
                <p className='text-xs text-gray-500'>{order.address.city}, {order.address.state}</p>
                <p className='text-xs text-gray-500'>{order.address.country} {order.address.zipcode}</p>
                <p className='text-xs text-gray-500 mt-1'>{order.address.phone}</p>
              </div>

              {/* Payment Info */}
              <div className='lg:w-40'>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Payment</p>
                <p className='text-sm font-medium text-gray-700'>{order.paymentMethod}</p>
                <span className={`inline-flex mt-1 px-2.5 py-1 text-xs font-semibold rounded-full ${order.payment ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {order.payment ? '✓ Paid' : '⏳ Pending'}
                </span>
                <p className='text-lg font-bold text-gray-900 mt-3'>{fmt(order.amount)}</p>
              </div>

              {/* Status */}
              <div className='lg:w-48'>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mb-3 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
                <select
                  onChange={(e) => statusHandler(e, order._id)}
                  value={order.status}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white transition-all'
                >
                  <option value='Order Placed'>Order Placed</option>
                  <option value='Packing'>Packing</option>
                  <option value='Shipped'>Shipped</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
                </select>
                <button
                  onClick={() => deleteOrder(order._id)}
                  className='mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Order
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOrders
