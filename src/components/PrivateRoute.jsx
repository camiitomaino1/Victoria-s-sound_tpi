import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {

  // Read the authenticated user from AuthContext
  const { user } = useContext(AuthContext)

  // If there is no logged in user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If there is a logged in user, render the protected component
  return children
}

export default PrivateRoute