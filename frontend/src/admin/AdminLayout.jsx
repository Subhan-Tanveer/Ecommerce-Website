import React, { useContext, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import AdminNavbar from './components/AdminNavbar'
import AdminSidebar from './components/AdminSidebar'
import AdminAdd from './pages/AdminAdd'
import AdminList from './pages/AdminList'
import AdminOrders from './pages/AdminOrders'
import AdminCategories from './pages/AdminCategories'
import AdminEditProduct from './pages/AdminEditProduct'
import AdminUsers from './pages/AdminUsers'
import { toast } from 'react-toastify'

const AdminLayout = () => {
  const { token, setToken, setCartItems, navigate, authReady } = useContext(ShopContext)
  const [accessChecked, setAccessChecked] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userPkg, setUserPkg] = useState(null)
  const [customPermissions, setCustomPermissions] = useState(null)

  useEffect(() => {
    if (!authReady) return
    if (!token) {
      toast.error('Please login to access the admin panel')
      navigate('/login')
      return
    }
    const role = localStorage.getItem('userRole')
    const pkg = localStorage.getItem('userPackage')
    if (role !== 'admin' && role !== 'vendor') {
      toast.error('Access denied.')
      navigate('/')
      return
    }
    setUserRole(role)
    setUserPkg(pkg)

    // Check for custom permission overrides
    const storedPerms = localStorage.getItem('userPermissions')
    const customPerms = storedPerms && storedPerms !== 'null' ? JSON.parse(storedPerms) : null

    if (customPerms && role === 'vendor') {
      // Use custom permissions
      setUserRole(role)
      setUserPkg(pkg)
      // Store custom perms to pass down
      setCustomPermissions(customPerms)
    }
    setAccessChecked(true)
  }, [authReady, token])

  if (!authReady || !accessChecked) return null

  const isAdmin = userRole === 'admin'

  // Use custom permissions if set, otherwise fall back to package defaults
  const p = customPermissions
  const canAddProduct    = isAdmin || (p ? p.canAddProduct    : userPkg === 'starter')
  const canEditProduct   = isAdmin || (p ? p.canEditProduct   : userPkg === 'starter' || userPkg === 'premium')
  const canDeleteProduct = isAdmin || (p ? p.canDeleteProduct : userPkg === 'starter')
  const canToggleProduct = isAdmin || (p ? p.canToggleProduct : userPkg === 'starter' || userPkg === 'premium')
  const canManageCategories = isAdmin || (p ? p.canManageCategories : userPkg === 'starter')
  const canManageUsers   = isAdmin

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userPackage')
    localStorage.removeItem('userPermissions')
    setToken('')
    setCartItems({})
    navigate('/')
    toast.success('Logged out successfully')
  }

  const permissions = { isAdmin, canAddProduct, canEditProduct, canDeleteProduct, canToggleProduct, canManageCategories, canManageUsers, userPkg }

  return (
    <div className='min-h-screen bg-gray-50'>
      <AdminNavbar onLogout={handleLogout} userRole={userRole} userPkg={userPkg} />
      <div className='flex w-full'>
        <AdminSidebar permissions={permissions} />
        <div className='flex-1 p-8 overflow-auto'>
          <Routes>
            <Route path='/' element={<Navigate to={canAddProduct ? 'add' : 'list'} replace />} />
            {canAddProduct && <Route path='add' element={<AdminAdd />} />}
            <Route path='list' element={<AdminList permissions={permissions} />} />
            {canEditProduct && <Route path='edit/:productId' element={<AdminEditProduct />} />}
            <Route path='categories' element={<AdminCategories canManage={canManageCategories} />} />
            <Route path='orders' element={<AdminOrders permissions={permissions} />} />
            {canManageUsers && <Route path='users' element={<AdminUsers />} />}
            <Route path='*' element={<Navigate to='list' replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
