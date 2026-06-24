import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const AdminRoute = ({ children }) => {

  // Read the authenticated user from AuthContext
  const { user } = useContext(AuthContext)

  // If there is no logged in user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If the user is logged in but does not have an admin role, redirect to products
  const isStaff = user.role === 'admin' || user.role === 'sysadmin'
  if (!isStaff) {
    return <Navigate to="/products" replace />
  }

  // User is logged in and has the right role: render the protected component
  return children
}

export default AdminRoute