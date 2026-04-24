import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const NavBar = () => {
  const [visible, setVisible] = useState(false)
  const [mobileCategOpen, setMobileCategOpen] = useState(false)
  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems, isAdmin, categories } = useContext(ShopContext)

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userPackage')
    localStorage.removeItem('userPermissions')
    setToken('')
    setCartItems({})
  }

  const handleCategoryClick = (catName, subName = null) => {
    // Navigate to collection with filter pre-applied via URL state
    navigate('/collection', { state: { category: catName, subCategory: subName } })
    setVisible(false)
    setMobileCategOpen(false)
  }

  return (
    <div className='flex items-center justify-between py-5 font-medium relative'>
      <Link to='/'>
        <img src={assets.logo} className='w-36' alt='Trendify' />
      </Link>

      {/* Desktop Nav */}
      <ul className='hidden gap-5 text-sm text-gray-700 sm:flex items-center'>
        <NavLink to='/' className='flex flex-col items-center gap-1'>
          <p>HOME</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
          <p>COLLECTION</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        {/* Categories Dropdown */}
        <li className='relative group'>
            <div className='flex flex-col items-center gap-1 cursor-pointer'>
              <div className='flex items-center gap-1'>
                <p>CATEGORIES</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mt-0.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </div>

            {/* Dropdown Panel */}
            <div className='absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50 min-w-[600px]'>
              <div className='bg-white border border-gray-200 rounded-2xl shadow-xl p-5'>
                {categories.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-2'>No categories yet</p>
                ) : (
                  <div className='grid gap-6' style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, minmax(0, 1fr))` }}>
                    {categories.map((cat) => (
                      <div key={cat._id}>
                        <button
                          onClick={() => handleCategoryClick(cat.name)}
                          className='text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 hover:text-gray-600 transition-colors text-left w-full'
                        >
                          {cat.name}
                        </button>
                        <div className='flex flex-col gap-1'>
                          {cat.subCategories.map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() => handleCategoryClick(cat.name, sub.name)}
                              className='text-sm text-gray-500 hover:text-gray-900 transition-colors text-left py-0.5'
                            >
                              {sub.name}
                            </button>
                          ))}
                          {cat.subCategories.length === 0 && (
                            <p className='text-xs text-gray-300 italic'>No sub categories</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>

        <NavLink to='/about' className='flex flex-col items-center gap-1'>
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      {/* Right Icons */}
      <div className='flex items-center gap-6'>
        <img onClick={() => setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt='Search' />

        <div className='relative group'>
          <img onClick={() => token ? null : navigate('/login')} src={assets.profile_icon} className='w-5 cursor-pointer' alt='Profile' />
          {token && (
            <div className='absolute right-0 hidden pt-4 group-hover:block dropdown-menu z-50'>
              <div className='flex flex-col gap-2 px-5 py-3 text-gray-500 rounded w-36 bg-slate-100 shadow-lg'>
                <p className='cursor-pointer hover:text-black'>Profile</p>
                {isAdmin() && (
                  <p onClick={() => navigate('/admin')} className='cursor-pointer hover:text-black font-medium text-blue-600'>Admin Panel</p>
                )}
                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className='w-5 min-w-5' alt='Cart' />
          <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
        </Link>

        <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt='Menu' />
      </div>

      {/* Mobile Sidebar */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-50 ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600 min-h-screen'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer border-b'>
            <img src={assets.dropdown_icon} className='h-4 rotate-180' alt='Back' />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border-b' to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border-b' to='/collection'>COLLECTION</NavLink>

          {/* Mobile Categories */}
          <div>
              <button
                onClick={() => setMobileCategOpen(p => !p)}
                className='w-full flex items-center justify-between py-3 pl-6 pr-4 border-b text-left'
              >
                <span>CATEGORIES</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${mobileCategOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileCategOpen && (
                <div className='bg-gray-50'>
                  {categories.length === 0 && (
                    <p className='text-xs text-gray-400 italic py-3 pl-8'>No categories yet</p>
                  )}
                  {categories.map((cat) => (
                    <div key={cat._id}>
                      <button
                        onClick={() => handleCategoryClick(cat.name)}
                        className='w-full text-left py-2.5 pl-8 pr-4 text-sm font-semibold text-gray-800 border-b border-gray-100 hover:bg-gray-100'
                      >
                        {cat.name}
                      </button>
                      {cat.subCategories.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => handleCategoryClick(cat.name, sub.name)}
                          className='w-full text-left py-2 pl-12 pr-4 text-sm text-gray-500 border-b border-gray-100 hover:bg-gray-100'
                        >
                          — {sub.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

          <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border-b' to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border-b' to='/contact'>CONTACT</NavLink>
        </div>
      </div>
    </div>
  )
}

export default NavBar
