import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'

const AdminEditProduct = () => {
  const { productId } = useParams()
  const { backendUrl, token } = useContext(ShopContext)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [subSubCategory, setSubSubCategory] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [sizes, setSizes] = useState([])
  const [bestSeller, setBestSeller] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [existingImages, setExistingImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const selectedCat = categories.find(c => c.name === category)
  const selectedSub = selectedCat?.subCategories.find(s => s.name === subCategory)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, catRes] = await Promise.all([
          axios.post(backendUrl + '/api/product/single', { productId }),
          axios.get(backendUrl + '/api/category/list')
        ])
        if (productRes.data.success) {
          const p = productRes.data.product
          setName(p.name)
          setDescription(p.description)
          setCategory(p.category)
          setSubCategory(p.subCategory)
          setSubSubCategory(p.subSubCategory || '')
          setPrice(p.price)
          setQuantity(p.quantity || 0)
          setSizes(p.sizes)
          setBestSeller(p.bestSeller)
          setIsActive(p.isActive !== false)
          setExistingImages(p.image)
        }
        if (catRes.data.success) setCategories(catRes.data.categories)
      } catch {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update',
        { productId, name, description, price, category, subCategory, subSubCategory, sizes, bestSeller, quantity },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Product updated successfully')
        navigate('/admin/list')
      } else {
        toast.error(response.data.message)
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const inputClass = 'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all'

  if (loading) return (
    <div className='flex items-center justify-center h-64'>
      <div className='w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin'></div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <button onClick={() => navigate('/admin/list')} className='p-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all'>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Edit Product</h1>
          <p className='text-sm text-gray-500 mt-0.5'>Update product details, quantity and availability</p>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-6 max-w-3xl'>

        {/* Current Images */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-base font-semibold text-gray-800 mb-1'>Current Images</h2>
          <p className='text-xs text-gray-400 mb-4'>To change images, delete this product and re-add it.</p>
          <div className='flex gap-3 flex-wrap'>
            {existingImages.map((img, i) => (
              <div key={i} className='w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden'>
                <img src={img} className='w-full h-full object-cover' alt={`Product ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Status & Quantity Card */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Inventory</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>

            {/* Quantity */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Stock Quantity</label>
              <div className='flex items-center gap-3'>
                <button type='button' onClick={() => setQuantity(q => Math.max(0, q - 1))}
                  className='w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all font-bold text-lg'>
                  −
                </button>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                  className='w-20 text-center px-3 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all'
                  type='number' min={0}
                />
                <button type='button' onClick={() => setQuantity(q => q + 1)}
                  className='w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all font-bold text-lg'>
                  +
                </button>
              </div>
            </div>

            {/* Active Toggle */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Product Status</label>
              <div className='flex items-center gap-3 mt-1'>
                <div
                  onClick={() => setIsActive(p => !p)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 cursor-pointer ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isActive ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </div>
                <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {isActive ? 'Active — Visible to customers' : 'Disabled — Hidden from store'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Basic Information</h2>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700'>Product Name <span className='text-red-500'>*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} type='text' required />
          </div>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700'>Description <span className='text-red-500'>*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} rows={4} required />
          </div>
        </div>

        {/* Pricing & Category */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Pricing & Category</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); setSubSubCategory('') }} className={`${inputClass} bg-white`}>
                <option value=''>Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Sub Category</label>
              <select value={subCategory} onChange={(e) => { setSubCategory(e.target.value); setSubSubCategory('') }} className={`${inputClass} bg-white`} disabled={!selectedCat}>
                <option value=''>Select Sub Category</option>
                {selectedCat?.subCategories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Type <span className='text-gray-400 text-xs'>(optional)</span></label>
              <select value={subSubCategory} onChange={(e) => setSubSubCategory(e.target.value)} className={`${inputClass} bg-white`} disabled={!selectedSub || selectedSub?.subSubCategories.length === 0}>
                <option value=''>Select Type</option>
                {selectedSub?.subSubCategories.map((ss, i) => <option key={i} value={ss}>{ss}</option>)}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Price (PKR) <span className='text-red-500'>*</span></label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} type='number' required />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Sizes & Options</h2>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Available Sizes</label>
            <div className='flex gap-2 flex-wrap'>
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button key={size} type='button'
                  onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                  className={`px-5 py-2 text-sm font-semibold rounded-xl border-2 transition-all select-none ${sizes.includes(size) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div onClick={() => setBestSeller(p => !p)} className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ${bestSeller ? 'bg-gray-900' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${bestSeller ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <span className='text-sm font-medium text-gray-700'>Mark as Best Seller</span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
          <button type='submit' className='flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all shadow-sm'>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
          <button type='button' onClick={() => navigate('/admin/list')} className='px-8 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all'>
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}

export default AdminEditProduct
