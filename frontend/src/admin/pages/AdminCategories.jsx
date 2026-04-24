import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'

const AdminCategories = ({ canManage = true }) => {
  const { backendUrl, token } = useContext(ShopContext)
  const [categories, setCategories] = useState([])

  // New category form
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatImage, setNewCatImage] = useState(null)

  // Sub / SubSub inputs
  const [newSubName, setNewSubName] = useState({})
  const [newSubSubName, setNewSubSubName] = useState({})

  // Expanded state
  const [expandedCat, setExpandedCat] = useState({})
  const [expandedSub, setExpandedSub] = useState({})

  // Edit state
  const [editingCat, setEditingCat] = useState(null) // categoryId being edited
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editImage, setEditImage] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/category/list')
      if (res.data.success) setCategories(res.data.categories)
    } catch { toast.error('Failed to load categories') }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return toast.error('Enter a category name')
    try {
      const formData = new FormData()
      formData.append('name', newCatName.trim())
      formData.append('description', newCatDesc.trim())
      if (newCatImage) formData.append('image', newCatImage)

      const res = await axios.post(backendUrl + '/api/category/add', formData, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message)
        setNewCatName(''); setNewCatDesc(''); setNewCatImage(null)
        fetchCategories()
      } else toast.error(res.data.message)
    } catch { toast.error('Failed to add category') }
  }

  const handleEditCategory = async (categoryId) => {
    if (!editName.trim()) return toast.error('Enter a category name')
    try {
      const formData = new FormData()
      formData.append('categoryId', categoryId)
      formData.append('name', editName.trim())
      formData.append('description', editDesc.trim())
      if (editImage) formData.append('image', editImage)
      const res = await axios.post(backendUrl + '/api/category/update', formData, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message)
        setEditingCat(null); setEditImage(null)
        fetchCategories()
      } else toast.error(res.data.message)
    } catch { toast.error('Failed to update category') }
  }

  const startEdit = (cat) => {
    setEditingCat(cat._id)
    setEditName(cat.name)
    setEditDesc(cat.description || '')
    setEditImage(null)
  }

  const cancelEdit = () => { setEditingCat(null); setEditImage(null) }

  const handleDeleteCategory = async (categoryId) => {
    const res = await axios.post(backendUrl + '/api/category/delete', { categoryId }, { headers: { token } })
    if (res.data.success) { toast.success(res.data.message); fetchCategories() }
    else toast.error(res.data.message)
  }

  const handleAddSubCategory = async (categoryId) => {
    const name = (newSubName[categoryId] || '').trim()
    if (!name) return toast.error('Enter a sub category name')
    const res = await axios.post(backendUrl + '/api/category/sub/add', { categoryId, name }, { headers: { token } })
    if (res.data.success) { toast.success(res.data.message); setNewSubName(p => ({ ...p, [categoryId]: '' })); fetchCategories() }
    else toast.error(res.data.message)
  }

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    const res = await axios.post(backendUrl + '/api/category/sub/delete', { categoryId, subCategoryId }, { headers: { token } })
    if (res.data.success) { toast.success(res.data.message); fetchCategories() }
    else toast.error(res.data.message)
  }

  const handleAddSubSubCategory = async (categoryId, subCategoryId) => {
    const name = (newSubSubName[subCategoryId] || '').trim()
    if (!name) return toast.error('Enter a type name')
    const res = await axios.post(backendUrl + '/api/category/subsub/add', { categoryId, subCategoryId, name }, { headers: { token } })
    if (res.data.success) { toast.success(res.data.message); setNewSubSubName(p => ({ ...p, [subCategoryId]: '' })); fetchCategories() }
    else toast.error(res.data.message)
  }

  const handleDeleteSubSubCategory = async (categoryId, subCategoryId, name) => {
    const res = await axios.post(backendUrl + '/api/category/subsub/delete', { categoryId, subCategoryId, name }, { headers: { token } })
    if (res.data.success) { toast.success(res.data.message); fetchCategories() }
    else toast.error(res.data.message)
  }

  const toggleCat = (id) => setExpandedCat(p => ({ ...p, [id]: !p[id] }))
  const toggleSub = (id) => setExpandedSub(p => ({ ...p, [id]: !p[id] }))

  const inputClass = 'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all'

  return (
    <div>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Category Manager</h1>
        <p className='text-sm text-gray-500 mt-1'>Build your category tree — Category → Sub Category → Type</p>
      </div>

      {/* Add Category Card — only shown if canManage */}
      {canManage && (
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6'>
        <h2 className='text-base font-semibold text-gray-800 mb-4'>Add New Category</h2>
        <div className='flex flex-col gap-4'>

          {/* Image + Name row */}
          <div className='flex gap-4 items-start'>
            {/* Image Upload */}
            <label htmlFor='catImage' className='cursor-pointer flex-shrink-0'>
              <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${newCatImage ? 'border-gray-900' : 'border-gray-300 hover:border-gray-500 bg-gray-50 hover:bg-gray-100'}`}>
                {newCatImage ? (
                  <img src={URL.createObjectURL(newCatImage)} className='w-full h-full object-cover rounded-xl' alt='preview' />
                ) : (
                  <div className='flex flex-col items-center gap-1 text-gray-400'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className='text-[10px] font-medium text-center leading-tight'>Category<br/>Image</span>
                  </div>
                )}
              </div>
              <input id='catImage' type='file' accept='image/*' hidden onChange={(e) => setNewCatImage(e.target.files[0])} />
            </label>

            {/* Name + Description */}
            <div className='flex-1 flex flex-col gap-3'>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className={inputClass}
                placeholder='Category name e.g. Men, Women, Electronics...'
              />
              <textarea
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Short description (optional) e.g. Explore our men's collection..."
              />
            </div>
          </div>

          {/* Add Button */}
          <div className='flex justify-end'>
            <button
              onClick={handleAddCategory}
              className='flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Category Tree — always visible */}
      {categories.length === 0 ? (
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400'>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className='text-sm font-medium'>No categories yet</p>
          <p className='text-xs mt-1'>Add your first category above</p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {categories.map((cat) => (
            <div key={cat._id} className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>

              {/* Category Header Row */}
              {editingCat === cat._id ? (
                <div className='flex gap-3 items-center px-6 py-4 bg-gray-50 border-b border-gray-200'>
                  <label htmlFor={`editImg-${cat._id}`} className='cursor-pointer flex-shrink-0'>
                    <div className='w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 overflow-hidden flex items-center justify-center bg-white'>
                      {editImage ? (
                        <img src={URL.createObjectURL(editImage)} className='w-full h-full object-cover' alt='preview' />
                      ) : cat.image ? (
                        <img src={cat.image} className='w-full h-full object-cover' alt={cat.name} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <input id={`editImg-${cat._id}`} type='file' accept='image/*' hidden onChange={(e) => setEditImage(e.target.files[0])} />
                  </label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`${inputClass} flex-1`} placeholder='Category name' />
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className={`${inputClass} flex-1`} placeholder='Description (optional)' />
                  <button onClick={() => handleEditCategory(cat._id)} className='flex-shrink-0 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-all'>Save</button>
                  <button onClick={cancelEdit} className='flex-shrink-0 px-4 py-2 bg-white text-gray-600 text-xs font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all'>Cancel</button>
                </div>
              ) : (
                <div className='flex items-center justify-between px-6 py-4 bg-gray-900 text-white'>
                  <div className='flex items-center gap-4'>
                    <button onClick={() => toggleCat(cat._id)} className='text-gray-400 hover:text-white transition-colors'>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${expandedCat[cat._id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {cat.image ? (
                      <img src={cat.image} className='w-10 h-10 rounded-lg object-cover border-2 border-gray-700' alt={cat.name} />
                    ) : (
                      <div className='w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center'>
                        <span className='text-white text-sm font-bold'>{cat.name[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className='font-semibold text-base'>{cat.name}</p>
                      {cat.description && <p className='text-xs text-gray-400 mt-0.5 max-w-md truncate'>{cat.description}</p>}
                    </div>
                    <span className='text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full'>{cat.subCategories.length} sub</span>
                  </div>
                  {canManage && <div className='flex items-center gap-2'>
                    <button onClick={() => startEdit(cat)} className='p-1.5 rounded-lg text-gray-400 hover:bg-blue-500 hover:text-white transition-all'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className='p-1.5 rounded-lg text-gray-400 hover:bg-red-500 hover:text-white transition-all'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>}
                </div>
              )}

              {/* Sub Categories */}
              {expandedCat[cat._id] && (
                <div className='px-6 py-4 flex flex-col gap-4'>

                  {/* Add Sub Category — only if canManage */}
                  {canManage && <div className='flex gap-2 ml-9'>
                    <input
                      value={newSubName[cat._id] || ''}
                      onChange={(e) => setNewSubName(p => ({ ...p, [cat._id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory(cat._id)}
                      className={inputClass}
                      placeholder={`Add sub category under "${cat.name}"...`}
                    />
                    <button
                      onClick={() => handleAddSubCategory(cat._id)}
                      className='flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white text-xs font-semibold rounded-xl hover:bg-gray-900 transition-all whitespace-nowrap'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>}

                  {/* Sub Category List */}
                  {cat.subCategories.map((sub) => (
                    <div key={sub._id} className='flex flex-col gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-6 flex-shrink-0 flex flex-col items-center'>
                          <div className='w-px h-3 bg-gray-200'></div>
                          <div className='w-3 h-px bg-gray-200'></div>
                        </div>
                        <div className='flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5'>
                          <div className='flex items-center gap-2'>
                            <button onClick={() => toggleSub(sub._id)} className='text-gray-400 hover:text-gray-700 transition-colors'>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform ${expandedSub[sub._id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div className='w-1.5 h-1.5 bg-gray-500 rounded-full'></div>
                            <span className='text-sm font-medium text-gray-700'>{sub.name}</span>
                            <span className='text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full'>{sub.subSubCategories.length} {sub.subSubCategories.length === 1 ? 'type' : 'types'}</span>
                          </div>
                          {canManage && (
                            <button onClick={() => handleDeleteSubCategory(cat._id, sub._id)} className='p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all'>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Types */}
                      {expandedSub[sub._id] && (
                        <div className='flex flex-col gap-2 ml-9'>
                          {canManage && (
                            <div className='flex gap-2'>
                              <input
                                value={newSubSubName[sub._id] || ''}
                                onChange={(e) => setNewSubSubName(p => ({ ...p, [sub._id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubSubCategory(cat._id, sub._id)}
                                className={`${inputClass} text-xs`}
                                placeholder={`Add type under ${sub.name}...`}
                              />
                              <button
                                onClick={() => handleAddSubSubCategory(cat._id, sub._id)}
                                className='flex items-center gap-1 px-3 py-2 bg-gray-700 text-white text-xs font-semibold rounded-xl hover:bg-gray-900 transition-all whitespace-nowrap'
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add
                              </button>
                            </div>
                          )}
                          <div className='flex flex-wrap gap-2'>
                            {sub.subSubCategories.map((ssub, i) => (
                              <div key={i} className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full'>
                                <div className='w-1 h-1 bg-blue-400 rounded-full'></div>
                                <span className='text-xs font-medium text-blue-700'>{ssub}</span>
                                {canManage && (
                                  <button onClick={() => handleDeleteSubSubCategory(cat._id, sub._id, ssub)} className='text-blue-400 hover:text-red-500 transition-colors ml-0.5'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            {sub.subSubCategories.length === 0 && (
                              <p className='text-xs text-gray-400 italic'>No types added yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {cat.subCategories.length === 0 && (
                    <p className='text-xs text-gray-400 italic ml-9'>No sub categories yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCategories
