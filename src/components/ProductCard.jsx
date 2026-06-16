import { useContext } from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const ProductCard = ({ id, nombre, marca, categoria, precio, descripcion, imagen }) => {

  // Connect to CartContext and get the addToCart function
  const { addToCart } = useContext(CartContext)

  // Build the product object to pass to addToCart
  const product = { id, nombre, marca, categoria, precio, descripcion, imagen }

  // Handler for the "Add to cart" button
  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <Card className="h-100 shadow-sm">

      {/* Product image with uniform height regardless of original resolution */}
      <Card.Img
        variant="top"
        src={imagen}
        alt={nombre}
        style={{ height: '200px', objectFit: 'cover' }}
      />

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">{nombre}</Card.Title>
          <Badge bg="secondary" className="ms-2">{categoria}</Badge>
        </div>

        {/* Brand name below the title */}
        <p className="text-muted small mb-2">{marca}</p>

        <Card.Text className="flex-grow-1">
          {descripcion}
        </Card.Text>

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