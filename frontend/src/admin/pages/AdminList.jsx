import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const AdminList = ({ permissions = {} }) => {
  const { backendUrl, token, getProductsData } = useContext(ShopContext)
  const { canEditProduct, canDeleteProduct, canToggleProduct, isAdmin } = permissions
  const [listProducts, setListProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [vendorFilter, setVendorFilter] = useState('all')
  const [inlineEdit, setInlineEdit] = useState({}) // { [productId]: { price, quantity } }
  const [savingId, setSavingId] = useState(null)
  const navigate = useNavigate()

  const fmt = (price) => 'Rs ' + new Intl.NumberFormat('en-PK').format(price)

  const fetchListProducts = async (filter = vendorFilter) => {
    try {
      const url = filter && filter !== 'all'
        ? `${backendUrl}/api/product/list?vendorFilter=${filter}`
        : `${backendUrl}/api/product/list`
      const response = await axios.get(url, { headers: { token } })
      if (response.data.success) setListProducts(response.data.products)
      else toast.error(response.data.message)
    } catch {
      toast.error('Failed to fetch products')
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/user/all', { headers: { token } })
      if (res.data.success) setVendors(res.data.users.filter(u => u.role === 'vendor'))
    } catch {}
  }

  const startInlineEdit = (item) => {
    setInlineEdit(p => ({ ...p, [item._id]: { price: item.price, quantity: item.quantity || 0 } }))
  }

  const cancelInlineEdit = (id) => {
    setInlineEdit(p => { const n = { ...p }; delete n[id]; return n })
  }

  const saveInlineEdit = async (item) => {
    const { price, quantity } = inlineEdit[item._id]
    setSavingId(item._id)
    try {
      const res = await axios.post(backendUrl + '/api/product/update', {
        productId: item._id, name: item.name, description: item.description,
        price, category: item.category, subCategory: item.subCategory,
        subSubCategory: item.subSubCategory, sizes: item.sizes,
        bestSeller: item.bestSeller, quantity
      }, { headers: { token } })
      if (res.data.success) { toast.success('Updated'); cancelInlineEdit(item._id); fetchListProducts(); getProductsData() }
      else toast.error(res.data.message)
    } catch { toast.error('Failed to update') }
    finally { setSavingId(null) }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) { toast.success('Product removed'); fetchListProducts() }
      else toast.error(response.data.message)
    } catch {
      toast.error('Failed to remove product')
    }
  }

  const toggleProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/toggle', { productId: id }, { headers: { token } })
      if (response.data.success) { toast.success(response.data.message); fetchListProducts() }
      else toast.error(response.data.message)
    } catch {
      toast.error('Failed to toggle product')
    }
  }

  useEffect(() => {
    fetchListProducts()
    if (isAdmin) fetchVendors()
  }, [])

  const activeCount = listProducts.filter(p => p.isActive !== false).length

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Products</h1>
          <p className='text-sm text-gray-500 mt-1'>
            {listProducts.length} total &nbsp;·&nbsp;
            <span className='text-green-600 font-medium'>{activeCount} active</span> &nbsp;·&nbsp;
            <span className='text-gray-400'>{listProducts.length - activeCount} disabled</span>
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {isAdmin && vendors.length > 0 && (
            <select
              value={vendorFilter}
              onChange={(e) => { setVendorFilter(e.target.value); fetchListProducts(e.target.value) }}
              className='px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 bg-white'
            >
              <option value='all'>All Vendors</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
              ))}
            </select>
          )}
          <button
            onClick={() => navigate('/admin/add')}
            className='flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full table-fixed'>
            <colgroup>
              <col style={{ width: '52px' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '80px' }} />
            </colgroup>

            {/* Header */}
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Img</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Product</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Category</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Sub Category</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Price</th>
                <th className='px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className='divide-y divide-gray-100'>
              {listProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className='py-20 text-center'>
                    <div className='flex flex-col items-center text-gray-400'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className='text-sm font-medium'>No products found</p>
                    </div>
                  </td>
                </tr>
              )}

              {listProducts.map((item) => {
                const active = item.isActive !== false
                return (
                  <tr
                    key={item._id}
                    className={`transition-colors ${active ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60 hover:opacity-80'}`}
                  >
                    {/* Image */}
                    <td className='px-4 py-3'>
                      <img className='w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0' src={item.image[0]} alt='Product' />
                    </td>

                    {/* Name + Qty */}
                    <td className='px-4 py-3'>
                      <p className='text-sm font-semibold text-gray-800 truncate' title={item.name}>{item.name}</p>
                      {canEditProduct && !isAdmin && inlineEdit[item._id] ? (
                        <input
                          type='number' min='0'
                          value={inlineEdit[item._id].quantity}
                          onChange={(e) => setInlineEdit(p => ({ ...p, [item._id]: { ...p[item._id], quantity: e.target.value } }))}
                          className='mt-1 w-20 px-2 py-0.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-gray-900'
                        />
                      ) : (
                        <p className='text-xs text-gray-400 mt-0.5'>
                          Qty: <span className={`font-semibold ${(item.quantity || 0) === 0 ? 'text-red-500' : 'text-gray-600'}`}>{item.quantity || 0}</span>
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className='px-4 py-3'>
                      <span className='inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap'>{item.category}</span>
                    </td>

                    {/* Sub Category */}
                    <td className='px-4 py-3'>
                      <span className='inline-flex px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full whitespace-nowrap'>{item.subCategory}</span>
                    </td>

                    {/* Price */}
                    <td className='px-4 py-3'>
                      {canEditProduct && !isAdmin && inlineEdit[item._id] ? (
                        <input
                          type='number' min='0'
                          value={inlineEdit[item._id].price}
                          onChange={(e) => setInlineEdit(p => ({ ...p, [item._id]: { ...p[item._id], price: e.target.value } }))}
                          className='w-24 px-2 py-0.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-gray-900'
                        />
                      ) : (
                        <p className='text-sm font-semibold text-gray-800 whitespace-nowrap'>{fmt(item.price)}</p>
                      )}
                    </td>

                    {/* Toggle */}
                    <td className='px-4 py-3'>
                      <div className='flex justify-center'>
                        {canToggleProduct ? (
                          <button
                            onClick={() => toggleProduct(item._id)}
                            title={active ? 'Click to disable' : 'Click to enable'}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 ${active ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </button>
                        ) : (
                          <span className={`w-11 h-6 rounded-full flex items-center px-0.5 ${active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <span className={`w-5 h-5 bg-white rounded-full shadow ${active ? 'translate-x-5' : 'translate-x-0'}`}></span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-center gap-1'>
                        {canEditProduct && isAdmin && (
                          <button
                            onClick={() => navigate(`/admin/edit/${item._id}`)}
                            className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all'
                            title='Edit product'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {canEditProduct && !isAdmin && !inlineEdit[item._id] && (
                          <button
                            onClick={() => startInlineEdit(item)}
                            className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all'
                            title='Edit price & quantity'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {canEditProduct && !isAdmin && inlineEdit[item._id] && (
                          <>
                            <button
                              onClick={() => saveInlineEdit(item)}
                              disabled={savingId === item._id}
                              className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all'
                              title='Save'
                            >
                              {savingId === item._id ? (
                                <svg className='w-4 h-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => cancelInlineEdit(item._id)}
                              className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all'
                              title='Cancel'
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {canDeleteProduct && (
                          <button
                            onClick={() => removeProduct(item._id)}
                            className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all'
                            title='Delete product'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        {!canEditProduct && !canDeleteProduct && (
                          <span className='text-xs text-gray-400 italic'>View only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminList
