import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'

const AdminAdd = () => {
  const { backendUrl, token } = useContext(ShopContext)

  const [image1, setImage1] = useState(null)
  const [image2, setImage2] = useState(null)
  const [image3, setImage3] = useState(null)
  const [image4, setImage4] = useState(null)
  const [image5, setImage5] = useState(null)
  const [image6, setImage6] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [subSubCategory, setSubSubCategory] = useState('')
  const [price, setPrice] = useState('')
  const [sizes, setSizes] = useState([])
  const [bestSeller, setBestSeller] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get(backendUrl + '/api/category/list').then(res => {
      if (res.data.success) setCategories(res.data.categories)
    })
  }, [])

  const selectedCat = categories.find(c => c.name === category)
  const selectedSub = selectedCat?.subCategories.find(s => s.name === subCategory)

  const resetForm = () => {
    setImage1(null); setImage2(null); setImage3(null); setImage4(null); setImage5(null); setImage6(null)
    setName(''); setDescription(''); setCategory(''); setSubCategory('')
    setSubSubCategory(''); setPrice(''); setSizes([]); setBestSeller(false)
    setQuantity(''); setIsActive(true)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)
      image5 && formData.append('image5', image5)
      image6 && formData.append('image6', image6)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('subSubCategory', subSubCategory)
      formData.append('price', price)
      formData.append('sizes', JSON.stringify(sizes))
      formData.append('bestSeller', bestSeller)
      formData.append('quantity', quantity || 0)
      formData.append('isActive', isActive)

      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        resetForm()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const imageSlots = [
    { id: 'image1', state: image1, setter: setImage1 },
    { id: 'image2', state: image2, setter: setImage2 },
    { id: 'image3', state: image3, setter: setImage3 },
    { id: 'image4', state: image4, setter: setImage4 },
    { id: 'image5', state: image5, setter: setImage5 },
    { id: 'image6', state: image6, setter: setImage6 },
  ]

  const inputClass = 'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all'

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Add New Product</h1>
        <p className='text-sm text-gray-500 mt-1'>Fill in the details below to add a new product to your store.</p>
      </div>

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-6 max-w-3xl'>

        {/* Images Card */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-base font-semibold text-gray-800 mb-1'>Product Images</h2>
          <p className='text-xs text-gray-400 mb-4'>Upload up to 4 images. First image will be the cover.</p>
          <div className='flex gap-3 flex-wrap'>
            {imageSlots.map(({ id, state, setter }, i) => (
              <label key={id} htmlFor={id} className='cursor-pointer group'>
                <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${state ? 'border-gray-900 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100'}`}>
                  {state ? (
                    <img src={URL.createObjectURL(state)} className='w-full h-full object-cover rounded-xl' alt='preview' />
                  ) : (
                    <div className='flex flex-col items-center gap-1 text-gray-400 group-hover:text-gray-600'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className='text-[10px] font-medium'>Image {i + 1}</span>
                    </div>
                  )}
                </div>
                <input onChange={(e) => setter(e.target.files[0])} type='file' id={id} hidden accept='image/*' />
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info Card */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Basic Information</h2>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700'>Product Name <span className='text-red-500'>*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} type='text' placeholder='e.g. Men Round Neck Cotton T-shirt' required />
          </div>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700'>Description <span className='text-red-500'>*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} rows={4} placeholder='Describe the product...' required />
          </div>
        </div>

        {/* Pricing & Category Card */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Pricing & Category</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Category */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Category <span className='text-red-500'>*</span></label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(''); setSubSubCategory('') }}
                className={`${inputClass} bg-white`}
                required
              >
                <option value=''>Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Sub Category */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Sub Category <span className='text-red-500'>*</span></label>
              <select
                value={subCategory}
                onChange={(e) => { setSubCategory(e.target.value); setSubSubCategory('') }}
                className={`${inputClass} bg-white`}
                required
                disabled={!selectedCat}
              >
                <option value=''>Select Sub Category</option>
                {selectedCat?.subCategories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Sub Sub Category */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Type <span className='text-gray-400 text-xs'>(optional)</span></label>
              <select
                value={subSubCategory}
                onChange={(e) => setSubSubCategory(e.target.value)}
                className={`${inputClass} bg-white`}
                disabled={!selectedSub || selectedSub?.subSubCategories.length === 0}
              >
                <option value=''>Select Type</option>
                {selectedSub?.subSubCategories.map((ss, i) => <option key={i} value={ss}>{ss}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-gray-700'>Price (PKR) <span className='text-red-500'>*</span></label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} type='number' placeholder='0.00' required />
            </div>
          </div>
        </div>

        {/* Sizes & Options Card */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5'>
          <h2 className='text-base font-semibold text-gray-800'>Sizes & Options</h2>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Available Sizes</label>
            <div className='flex gap-2 flex-wrap'>
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size} type='button'
                  onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                  className={`px-5 py-2 text-sm font-semibold rounded-xl border-2 transition-all select-none ${sizes.includes(size) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div
              onClick={() => setBestSeller(p => !p)}
              className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ${bestSeller ? 'bg-gray-900' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${bestSeller ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <span className='text-sm font-medium text-gray-700'>Mark as Best Seller</span>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-gray-700'>Quantity in Stock</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputClass}
              type='number'
              min='0'
              placeholder='e.g. 100'
            />
          </div>

          <div className='flex items-center gap-3'>
            <div
              onClick={() => setIsActive(p => !p)}
              className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ${isActive ? 'bg-gray-900' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <span className='text-sm font-medium text-gray-700'>Active <span className='text-xs text-gray-400'>(visible on store)</span></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed'>
            {loading ? (
              <svg className='w-4 h-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            {loading ? 'Adding...' : 'Add Product'}
          </button>
          <button type='button' onClick={resetForm} className='px-8 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all'>
            Reset
          </button>
        </div>

      </form>
    </div>
  )
}

export default AdminAdd
