import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const ProductDetail = () => {

  // Get the product id from the URL
  const { id } = useParams()
  const navigate = useNavigate()

  // Get addToCart from CartContext
  const { addToCart } = useContext(CartContext)

  // State for the product data
  const [product, setProduct] = useState(null)

  // Loading state while fetching
  const [loading, setLoading] = useState(true)

  // Error state if the fetch fails
  const [error, setError] = useState(null)

  // State for the selected quantity
  const [quantity, setQuantity] = useState(1)

  // Success message after adding to cart
  const [addedMessage, setAddedMessage] = useState(false)

  // Fetch the product when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`)

        if (!response.ok) {
          throw new Error('Producto no encontrado')
        }

        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Increase quantity by 1
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  // Decrease quantity by 1, minimum is 1
  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  // Add the product to the cart with the selected quantity
  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedMessage(true)

    // Hide the success message after 2 seconds
    setTimeout(() => setAddedMessage(false), 2000)
  }

  // Show loading spinner while fetching
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando producto...</p>
      </Container>
    )
  }

  // Show error message if the fetch failed
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="dark" onClick={() => navigate('/products')}>
          Volver a productos
        </Button>
      </Container>
    )
  }

  return (
    <Container className="mt-4">

      {/* Success message after adding to cart */}
      {addedMessage && (
        <Alert variant="success">
          ¡Producto agregado al carrito correctamente!
        </Alert>
      )}

      <Row className="g-4">

        {/* Product image */}
        <Col md={5}>
          <Card className="border-0 shadow-sm">
            {product.imagen ? (
              <Card.Img
                src={product.imagen}
                alt={product.nombre}
                style={{ height: '400px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <div
                className="bg-secondary d-flex align-items-center justify-content-center"
                style={{ height: '400px', borderRadius: '8px' }}
              >
                <p className="text-white">Sin imagen</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Product info */}
        <Col md={7}>
          <div className="d-flex align-items-start justify-content-between mb-2">
            <h2 className="mb-0">{product.nombre}</h2>
            <Badge bg="secondary" className="ms-2 mt-1">{product.categoria}</Badge>
          </div>

          <p className="text-muted mb-1">
            <strong>Marca:</strong> {product.marca}
          </p>

          <p className="text-muted mb-3">{product.descripcion}</p>

          <h3 className="mb-4">${product.precio.toLocaleString()}</h3>

          {/* Quantity selector */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="fw-bold">Cantidad:</span>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-dark"
                size="sm"
                onClick={handleDecrease}
              >
                −
              </Button>
              <span className="fs-5 px-2">{quantity}</span>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={handleIncrease}
              >
                +
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-3">
            <Button variant="dark" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i> Agregar al carrito
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/products')}>
              Volver a productos
            </Button>
          </div>

        </Col>
      </Row>
    </Container>
  )
}

export default ProductDetail