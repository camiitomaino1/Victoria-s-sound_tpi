import { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const Favorites = () => {

  const { fetchWithAuth } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:3000/favorites')
        if (!response.ok) throw new Error('Error al obtener favoritos')
        const data = await response.json()
        setFavorites(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const handleRemoveFavorite = async (productId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3000/favorites/${productId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Error al eliminar favorito')
      setFavorites(favorites.filter((p) => p.id !== productId))
      setFeedback({ type: 'success', message: 'Producto eliminado de favoritos' })
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    }
  }

  const getStockVariant = (stock) => {
    if (stock === 0) return 'danger'
    if (stock <= 10) return 'warning'
    return 'success'
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando favoritos...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">
        <i className="bi bi-heart-fill me-2 text-danger"></i>
        Mis favoritos
      </h2>

      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <Alert variant="info">
          No tenés productos favoritos todavía. ¡Explorá el catálogo y guardá los que más te gusten!
        </Alert>
      ) : (
        <Row xs={1} sm={2} lg={3} className="g-4">
          {favorites.map((product) => (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm">
                <Link to={`/products/${product.id}`}>
                  <Card.Img
                    variant="top"
                    src={product.imagen || 'https://placehold.co/400x200?text=Sin+imagen'}
                    alt={product.nombre}
                    className="product-card-img"
                  />
                </Link>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0">
                      <Link to={`/products/${product.id}`} className="text-dark text-decoration-none">
                        {product.nombre}
                      </Link>
                    </Card.Title>
                    <Badge bg="secondary" className="ms-2">{product.categoria}</Badge>
                  </div>

                  <p className="text-muted small mb-2">{product.marca}</p>
                  <Card.Text className="flex-grow-1">{product.descripcion}</Card.Text>

                  <div className="mb-2">
                    <Badge bg={getStockVariant(product.stock)}>
                      {product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}`}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="fw-bold fs-5">${product.precio.toLocaleString()}</span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stock === 0}
                        title="Agregar al carrito"
                      >
                        <i className="bi bi-cart-plus"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveFavorite(product.id)}
                        title="Quitar de favoritos"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

export default Favorites