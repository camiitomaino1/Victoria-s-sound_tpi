import { createContext, useState, useEffect, useContext } from 'react'

// Create the authentication context
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  // Global state for the authenticated user
  // Starts as null (no user logged in)
  const [user, setUser] = useState(null)

  // Global state for the JWT token
  const [token, setToken] = useState(null)

  // Loading state to avoid rendering before checking localStorage
  const [loading, setLoading] = useState(true)

  // When the app loads, check if there is a saved session in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      // Restore the session from localStorage
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    // Session check is done, allow the app to render
    setLoading(false)
  }, [])

  // Login function: sends credentials to the API and saves the session
  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    // If the server responded with an error, throw it so the component can handle it
    if (!response.ok) {
      throw new Error(data.message)
    }

    // Save the token and user data in state and localStorage
    setToken(data.token)
    setUser({ id: data.id, nombre: data.nombre, email: data.email, role: data.role })

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      role: data.role
    }))
  }

  // Register function: sends new user data to the API
  const register = async (nombre, email, password) => {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    })

    const data = await response.json()

    // If the server responded with an error, throw it so the component can handle it
    if (!response.ok) {
      throw new Error(data.message)
    }

    // Register does not log the user in automatically
    // The user will be redirected to login after registering
    return data
  }

  // Logout function: clears the session from state and localStorage
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Values and functions available to all components
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render the app until the session check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  )
}
