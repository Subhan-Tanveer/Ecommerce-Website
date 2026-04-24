import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../../context/ShopContext'

const roleColors = { user: 'bg-gray-100 text-gray-600', vendor: 'bg-blue-100 text-blue-700', admin: 'bg-purple-100 text-purple-700' }
const pkgColors = { none: 'bg-gray-100 text-gray-400', starter: 'bg-blue-100 text-blue-700', booster: 'bg-purple-100 text-purple-700', premium: 'bg-yellow-100 text-yellow-700' }

const defaultPerms = {
  starter: { canAddProduct: true,  canEditProduct: true,  canDeleteProduct: true,  canToggleProduct: true,  canManageCategories: true  },
  booster: { canAddProduct: false, canEditProduct: false, canDeleteProduct: false, canToggleProduct: false, canManageCategories: false },
  premium: { canAddProduct: false, canEditProduct: true,  canDeleteProduct: false, canToggleProduct: true,  canManageCategories: false },
  none:    { canAddProduct: false, canEditProduct: false, canDeleteProduct: false, canToggleProduct: false, canManageCategories: false },
}

const permLabels = {
  canAddProduct: 'Add Products',
  canEditProduct: 'Edit Products',
  canDeleteProduct: 'Delete Products',
  canToggleProduct: 'Toggle Active/Inactive',
  canManageCategories: 'Manage Categories',
}

const AdminUsers = () => {
  const { backendUrl, token } = useContext(ShopContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [permModal, setPermModal] = useState(null) // { userId, name, pkg, perms }
  const [editPerms, setEditPerms] = useState({})

  const fetchUsers = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/user/all', { headers: { token } })
      if (res.data.success) setUsers(res.data.users)
      else toast.error(res.data.message)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const updateAccess = async (userId, role, pkg) => {
    setUpdating(userId)
    try {
      const res = await axios.post(backendUrl + '/api/user/access', { userId, role, package: pkg }, { headers: { token } })
      if (res.data.success) { toast.success('Access updated'); fetchUsers() }
      else toast.error(res.data.message)
    } catch { toast.error('Failed to update access') }
    finally { setUpdating(null) }
  }

  const openPermModal = (user) => {
    const base = defaultPerms[user.package] || defaultPerms.none
    const current = user.permissions || base
    setEditPerms({ ...base, ...current })
    setPermModal({ userId: user._id, name: user.name, pkg: user.package })
  }

  const savePermissions = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/user/permissions', { userId: permModal.userId, permissions: editPerms }, { headers: { token } })
      if (res.data.success) { toast.success('Permissions saved'); setPermModal(null); fetchUsers() }
      else toast.error(res.data.message)
    } catch { toast.error('Failed to save permissions') }
  }

  const resetToPackage = () => {
    setEditPerms({ ...defaultPerms[permModal.pkg] || defaultPerms.none })
  }

  useEffect(() => { fetchUsers() }, [])

  const selectClass = 'px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-gray-900 bg-white transition-all'

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>User Management</h1>
          <p className='text-sm text-gray-500 mt-1'>Assign vendor access and customize permissions</p>
        </div>
        <button onClick={fetchUsers} className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all'>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>User</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Role</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Package</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Assign Access</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {users.map((user) => (
                <tr key={user._id} className='hover:bg-gray-50 transition-colors'>
                  {/* User Info */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0'>
                        <span className='text-white text-sm font-bold'>{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                        <p className='text-xs text-gray-400'>{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className='px-6 py-4'>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Package */}
                  <td className='px-6 py-4'>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${pkgColors[user.package] || 'bg-gray-100 text-gray-400'}`}>
                      {user.package === 'none' ? 'No Package' : `${user.package} Package`}
                    </span>
                  </td>

                  {/* Assign Access */}
                  <td className='px-6 py-4'>
                    {user.role === 'admin' ? (
                      <span className='text-xs text-gray-400 italic'>Super Admin</span>
                    ) : (
                      <div className='flex items-center gap-2 flex-wrap'>
                        {/* Role Dropdown */}
                        <select
                          defaultValue={user.role}
                          onChange={(e) => {
                            const newRole = e.target.value
                            const pkg = newRole === 'vendor' ? (user.package === 'none' ? 'starter' : user.package) : 'none'
                            updateAccess(user._id, newRole, pkg)
                          }}
                          className={selectClass}
                          disabled={updating === user._id}
                        >
                          <option value='user'>User (No Access)</option>
                          <option value='vendor'>Vendor</option>
                        </select>

                        {/* Package Dropdown — only for vendors */}
                        {user.role === 'vendor' && (
                          <select
                            defaultValue={user.package}
                            onChange={(e) => updateAccess(user._id, 'vendor', e.target.value)}
                            className={selectClass}
                            disabled={updating === user._id}
                          >
                            <option value='starter'>Starter</option>
                            <option value='booster'>Booster</option>
                            <option value='premium'>Premium</option>
                          </select>
                        )}

                        {/* Permissions Icon — only for vendors */}
                        {user.role === 'vendor' && (
                          <button
                            onClick={() => openPermModal(user)}
                            title='Edit Permissions'
                            className='w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all'
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}

                        {updating === user._id && (
                          <svg className='w-4 h-4 animate-spin text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                          </svg>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Permissions Modal */}
      {permModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md'>
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
              <div>
                <h2 className='text-base font-bold text-gray-900'>Edit Permissions</h2>
                <p className='text-xs text-gray-400 mt-0.5'>{permModal.name} · <span className='capitalize'>{permModal.pkg} Package</span></p>
              </div>
              <button onClick={() => setPermModal(null)} className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all'>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Permissions Toggles */}
            <div className='px-6 py-5 flex flex-col gap-3'>
              <p className='text-xs text-gray-400 mb-1'>Toggle individual permissions for this vendor. These override the package defaults.</p>
              {Object.entries(permLabels).map(([key, label]) => (
                <div key={key} className='flex items-center justify-between py-2 border-b border-gray-100 last:border-0'>
                  <span className='text-sm font-medium text-gray-700'>{label}</span>
                  <div
                    onClick={() => setEditPerms(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ${editPerms[key] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${editPerms[key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
              <button onClick={resetToPackage} className='text-xs text-gray-500 hover:text-gray-800 underline transition-all'>
                Reset to package defaults
              </button>
              <div className='flex gap-2'>
                <button onClick={() => setPermModal(null)} className='px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all'>
                  Cancel
                </button>
                <button onClick={savePermissions} className='px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black transition-all'>
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
