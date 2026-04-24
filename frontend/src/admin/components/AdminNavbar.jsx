import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const AdminNavbar = ({ onLogout, userRole, userPkg }) => {
  const pkgColors = { starter: 'bg-blue-100 text-blue-700', booster: 'bg-purple-100 text-purple-700', premium: 'bg-yellow-100 text-yellow-700' }
  return (
    <div className='w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50'>
      <div className='flex items-center justify-between py-3 px-8'>
        <div className='flex items-center gap-4'>
          <Link to='/'>
            <img className='w-32' src={assets.logo} alt='Trendify' />
          </Link>
          <div className='h-6 w-px bg-gray-300'></div>
          <span className='text-sm font-semibold text-gray-500 tracking-widest uppercase'>Admin Panel</span>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center'>
              <span className='text-white text-xs font-bold'>{userRole === 'vendor' ? 'V' : 'A'}</span>
            </div>
            <div className='hidden sm:flex flex-col'>
              <span className='text-sm font-medium text-gray-700'>{userRole === 'vendor' ? 'Vendor' : 'Admin'}</span>
              {userRole === 'vendor' && userPkg && userPkg !== 'none' && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${pkgColors[userPkg] || 'bg-gray-100 text-gray-600'}`}>
                  {userPkg} Package
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminNavbar
