import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const CategoryShowcase = () => {
  const { categories, navigate } = useContext(ShopContext)

  if (!categories || categories.length === 0) return null

  return (
    <div className='my-16 px-4 sm:px-0'>
      {/* Section Header */}
      <div className='text-center mb-10'>
        <p className='text-xs tracking-widest text-gray-400 uppercase mb-2'>Browse By</p>
        <h2 className='text-3xl font-light text-gray-900'>
          SHOP BY <span className='font-semibold'>CATEGORY</span>
          <span className='inline-block w-8 h-px bg-gray-400 ml-3 align-middle'></span>
        </h2>
      </div>

      {/* Category Cards */}
      <div className={`grid gap-4 ${categories.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : categories.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {categories.map((cat, i) => (
          <div
            key={cat._id}
            onClick={() => navigate('/collection', { state: { category: cat.name } })}
            className='group relative overflow-hidden rounded-2xl cursor-pointer aspect-[3/4] bg-gray-100'
          >
            {/* Background Image */}
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-6xl font-bold text-white
                ${i % 3 === 0 ? 'bg-gray-800' : i % 3 === 1 ? 'bg-gray-600' : 'bg-gray-700'}`}>
                {cat.name[0]}
              </div>
            )}

            {/* Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'></div>

            {/* Content */}
            <div className='absolute bottom-0 left-0 right-0 p-6'>
              <p className='text-white text-xl font-semibold tracking-wide'>{cat.name}</p>
              {cat.description && (
                <p className='text-gray-300 text-xs mt-1 line-clamp-2'>{cat.description}</p>
              )}

              {/* Sub category pills */}
              {cat.subCategories?.length > 0 && (
                <div className='flex flex-wrap gap-1.5 mt-3'>
                  {cat.subCategories.slice(0, 3).map(sub => (
                    <span
                      key={sub._id}
                      onClick={(e) => { e.stopPropagation(); navigate('/collection', { state: { category: cat.name, subCategory: sub.name } }) }}
                      className='text-[11px] px-2.5 py-1 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-all cursor-pointer'
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Shop Now */}
              <div className='mt-4 flex items-center gap-1.5 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0'>
                <span>Shop Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryShowcase
