import { Container, Form, Button } from 'react-bootstrap'

const Login = () => {
  return (
    <Container className="mt-4" style={{ maxWidth: '400px' }}>
      <h2>Iniciar sesión</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="tu@email.com" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" placeholder="••••••••" />
        </Form.Group>
        <Button variant="dark" type="submit" className="w-100">
          Ingresar
        </Button>
      </Form>
    </Container>
  )
}

export default Login