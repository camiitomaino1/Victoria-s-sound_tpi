import { Container, Form, Button } from 'react-bootstrap'

const Register = () => {
  return (
    <Container className="mt-4" style={{ maxWidth: '400px' }}>
      <h2>Registrarse</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" placeholder="Tu nombre" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="tu@email.com" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control type="password" placeholder="••••••••" />
        </Form.Group>
        <Button variant="dark" type="submit" className="w-100">
          Crear cuenta
        </Button>
      </Form>
    </Container>
  )
}

export default Register