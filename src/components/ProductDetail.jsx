import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const ProductDetail = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedMessage, setAddedMessage] = useState(false)

  // Returns Bootstrap color class based on stock level
  const getStockVariant = (stock) => {
    if (stock === 0) return 'danger'
    if (stock <= 10) return 'warning'
    return 'success'
  }

  // Returns stock label text
  const getStockLabel = (stock) => {
    if (stock === 0) return 'Sin stock'
    if (stock <= 10) return `Stock bajo: ${stock} disponibles`
    return `Stock disponible: ${stock}`
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`)

        if (!response.ok) throw new Error('Producto no encontrado')

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

  // Increase quantity, cannot exceed available stock
  const handleIncrease = () => {
    setQuantity((prev) => (prev < product.stock ? prev + 1 : prev))
  }

  // Decrease quantity, minimum is 1
  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedMessage(true)
    setTimeout(() => setAddedMessage(false), 2000)
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando producto...</p>
      </Container>
    )
  }

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

          <h3 className="mb-3">${product.precio.toLocaleString()}</h3>

          {/* Stock indicator with color coding */}
          <p className={`fw-bold text-${getStockVariant(product.stock)} mb-4`}>
            {getStockLabel(product.stock)}
          </p>

          {/* Quantity selector: hidden if no stock */}
          {product.stock > 0 && (
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
                  // Disable if quantity already reaches max stock
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="d-flex gap-3">
            <Button
              variant="dark"
              onClick={handleAddToCart}
              // Disable if no stock available
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Sin stock' : (
                <><i className="bi bi-cart-plus"></i> Agregar al carrito</>
              )}
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