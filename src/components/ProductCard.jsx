import { useContext } from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

const ProductCard = ({ id, nombre, marca, categoria, precio, descripcion, imagen }) => {

  const { addToCart } = useContext(CartContext)

  const product = { id, nombre, marca, categoria, precio, descripcion, imagen }

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  return (
    <Card className="h-100 shadow-sm">

      {/* Product image links to detail page */}
      <Link to={`/products/${id}`}>
        <Card.Img
          variant="top"
          src={imagen || 'https://placehold.co/400x200?text=Sin+imagen'}
          alt={nombre}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">

          {/* Product name links to detail page */}
          <Card.Title className="mb-0">
            <Link
              to={`/products/${id}`}
              className="text-dark text-decoration-none"
            >
              {nombre}
            </Link>
          </Card.Title>

          <Badge bg="secondary" className="ms-2">{categoria}</Badge>
        </div>

        <p className="text-muted small mb-2">{marca}</p>

        <Card.Text className="flex-grow-1">{descripcion}</Card.Text>

        <div className="mt-3 d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5">${precio.toLocaleString()}</span>
          <Button variant="dark" size="sm" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard