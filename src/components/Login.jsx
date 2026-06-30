import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Login = () => {

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [touched, setTouched] = useState({ email: false, password: false })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = (mail) => emailRegex.test(mail)

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setTouched({ email: true, password: true })

    if (!isEmailValid(email)) {
      setError('Ingresá un email válido.')
      return
    }

    if (password.trim() === '') {
      setError('Ingresá tu contraseña.')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Iniciar sesión</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} noValidate>

        <Form.Group className="mb-3">
          <Form.Label>
            Email <span className="required-asterisk">*</span>
          </Form.Label>
          <Form.Control
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            isInvalid={touched.email && !isEmailValid(email)}
            isValid={touched.email && isEmailValid(email)}
          />
          <Form.Control.Feedback type="invalid">
            Ingresá un email válido.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Contraseña <span className="required-asterisk">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            isInvalid={touched.password && password.trim() === ''}
          />
          <Form.Control.Feedback type="invalid">
            Ingresá tu contraseña.
          </Form.Control.Feedback>
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