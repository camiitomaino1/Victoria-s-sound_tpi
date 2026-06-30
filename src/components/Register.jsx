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

  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    password: false,
    confirmPassword: false
  })

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const isPasswordValid = (pwd) => passwordRegex.test(pwd)
  const isEmailValid = (mail) => emailRegex.test(mail)
  const isNombreValid = (value) => value.trim().length >= 2

  // Capitalizes the first letter of each word as the user types
  const capitalizeWords = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const handleNombreChange = (e) => {
    setNombre(capitalizeWords(e.target.value))
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    setTouched({ nombre: true, email: true, password: true, confirmPassword: true })

    if (!isNombreValid(nombre)) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }

    if (!isEmailValid(email)) {
      setError('Ingresá un email válido.')
      return
    }

    if (!isPasswordValid(password)) {
      setError('La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      await register(nombre, email, password)
      setSuccess('Cuenta creada correctamente. Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '420px' }}>
      <h2 className="mb-4">Crear cuenta</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit} noValidate>

        <Form.Group className="mb-3">
          <Form.Label>
            Nombre <span className="required-asterisk">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={handleNombreChange}
            onBlur={() => handleBlur('nombre')}
            isInvalid={touched.nombre && !isNombreValid(nombre)}
            isValid={touched.nombre && isNombreValid(nombre)}
          />
          <Form.Control.Feedback type="invalid">
            El nombre debe tener al menos 2 caracteres.
          </Form.Control.Feedback>
        </Form.Group>

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
            isInvalid={touched.password && !isPasswordValid(password)}
            isValid={touched.password && isPasswordValid(password)}
          />
          <Form.Control.Feedback type="invalid">
            Debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial.
          </Form.Control.Feedback>
          <Form.Text className="password-hint">
            La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            Confirmar contraseña <span className="required-asterisk">*</span>
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            isInvalid={touched.confirmPassword && password !== confirmPassword}
            isValid={touched.confirmPassword && confirmPassword !== '' && password === confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            Las contraseñas no coinciden.
          </Form.Control.Feedback>
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