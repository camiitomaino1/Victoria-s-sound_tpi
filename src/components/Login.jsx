import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Login = () => {

  // Get the login function from AuthContext
  const { login } = useContext(AuthContext)

  // Hook to redirect the user after successful login
  const navigate = useNavigate()

  // State for the email input
  const [email, setEmail] = useState('')

  // State for the password input
  const [password, setPassword] = useState('')

  // State for the error message
  const [error, setError] = useState(null)

  // State for the loading indicator while the request is in progress
  const [loading, setLoading] = useState(false)

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setLoading(true)

    try {
      // Call the login function from AuthContext
      await login(email, password)

      // If login was successful, redirect to products
      navigate('/products')

    } catch (err) {
      // Show the error message returned by the API
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Iniciar sesión</h2>

      {/* Show error message if login failed */}
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="dark"
          type="submit"
          className="w-100"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Form>

      <p className="mt-3 text-center">
        ¿No tenés cuenta?{' '}
        <Link to="/register">Registrate</Link>
      </p>
    </Container>
  )
}

export default Login