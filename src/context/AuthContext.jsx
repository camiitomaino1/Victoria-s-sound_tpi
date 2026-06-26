import { createContext, useState, useEffect, useContext } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

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

  const register = async (nombre, email, password) => {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Wrapper for authenticated fetch requests
  // Automatically logs out the user if the token is expired or invalid
  const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    })

    // If the server responds with 401 or 403, the token is expired or invalid
    if (response.status === 401 || response.status === 403) {
      logout()
      throw new Error('Tu sesión expiró. Por favor iniciá sesión nuevamente.')
    }

    return response
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchWithAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}