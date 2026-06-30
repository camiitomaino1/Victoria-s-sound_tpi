import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <Container className="mt-5 text-center">
      <h1 className="display-1 fw-bold" style={{ color: 'var(--color-primary)' }}>404</h1>
      <h2 className="mb-3">Página no encontrada</h2>
      <p className="home-description mb-4">
        La página que buscás no existe o fue movida.
      </p>
      <Button as={Link} to="/" variant="dark" size="lg">
        Volver al inicio
      </Button>
    </Container>
  )
}

export default NotFound