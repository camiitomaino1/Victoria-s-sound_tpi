import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      {/* Hero section with banner background */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Victoria's Sound: Tu Pasión, Nuestro Sonido
          </h1>
          <p className="hero-subtitle">
            Explorá nuestra colección exclusiva de instrumentos de alta gama
          </p>
          <Button
            as={Link}
            to="/products"
            className="hero-cta"
            size="lg"
          >
            Ver Catálogo
          </Button>
        </div>
      </div>

      <Container className="mt-5 text-center">
        <h2 className="mb-3">¿Por qué elegirnos?</h2>
        <p className="home-description">
          En Victoria's Sound encontrás instrumentos de las mejores marcas del mundo,
          con asesoramiento personalizado y los mejores precios del mercado.
        </p>
      </Container>
    </>
  )
}

export default Home