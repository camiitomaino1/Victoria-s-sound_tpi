import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Register = () => {

  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  // Regex that enforces: min 8 chars, uppercase, lowercase, number and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

  // Validate password against the security regex
  const isPasswordValid = (pwd) => passwordRegex.test(pwd)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate password strength before sending the request
    if (!isPasswordValid(password)) {
      setError('La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.')
      return
    }

    // Validate that both password fields match before sending the request
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      await register(nombre, email, password)
      setSuccess('Cuenta creada correctamente. Redirigiendo al login...')

      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Crear cuenta</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>

        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Password requirements hint shown while the user types */}
          <Form.Text className="text-muted">
            La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirmar contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {/* Live feedback if passwords don't match while the user types */}
          {confirmPassword && password !== confirmPassword && (
            <Form.Text className="text-danger">
              Las contraseñas no coinciden.
            </Form.Text>
          )}
          {/* Positive feedback when passwords match */}
          {confirmPassword && password === confirmPassword && (
            <Form.Text className="text-success">
              Las contraseñas coinciden.
            </Form.Text>
          )}
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