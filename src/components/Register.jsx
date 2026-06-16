import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Register = () => {

  // Get the register function from AuthContext
  const { register } = useContext(AuthContext)

  // Hook to redirect the user after successful registration
  const navigate = useNavigate()

  // State for the nombre input
  const [nombre, setNombre] = useState('')

  // State for the email input
  const [email, setEmail] = useState('')

  // State for the password input
  const [password, setPassword] = useState('')

  // State for the error message
  const [error, setError] = useState(null)

  // State for the success message
  const [success, setSuccess] = useState(null)

  // State for the loading indicator while the request is in progress
  const [loading, setLoading] = useState(false)

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous messages
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Call the register function from AuthContext
      await register(nombre, email, password)

      // Show success message before redirecting
      setSuccess('Cuenta creada correctamente. Redirigiendo al login...')

      // Wait 2 seconds and redirect to login
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      // Show the error message returned by the API
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Crear cuenta</h2>

      {/* Show error message if registration failed */}
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Show success message if registration was successful */}
      {success && (
        <Alert variant="success">{success}</Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Form.Group>

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
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </Button>
      </Form>

      <p className="mt-3 text-center">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login">Iniciá sesión</Link>
      </p>
    </Container>
  )
}

export default Register