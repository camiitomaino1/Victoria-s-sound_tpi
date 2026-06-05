import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <Container className="text-center mt-5">
      <h1>Bienvenid@ a Victoria´s Sound 🎵</h1>
      <p className="lead mt-3">
        Encontrá los mejores instrumentos musicales al mejor precio.
      </p>
      <Button as={Link} to="/products" variant="dark" size="lg" className="mt-3">
        Ver productos
      </Button>
    </Container>
  )
}

export default Home