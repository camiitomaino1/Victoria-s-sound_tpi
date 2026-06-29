import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const SysAdminRoute = ({ children }) => {

  // Read the authenticated user from AuthContext
  const { user } = useContext(AuthContext)

  // If there is no logged in user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If the user is not sysadmin, redirect to home
  if (user.role !== 'sysadmin') {
    return <Navigate to="/" replace />
  }

  // User is sysadmin: render the protected component
  return children
}

export default SysAdminRoute