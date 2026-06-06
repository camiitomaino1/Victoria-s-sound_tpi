import { useContext } from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const ProductCard = ({ id, nombre, categoria, precio, descripcion }) => {

  // Connect to CartContext and get the addToCart function
  const { cart, addToCart } = useContext(CartContext)

  // Build the product object to pass to addToCart
  const product = { id, nombre, categoria, precio, descripcion }

  // Handler for the "Add to cart" button
  const handleAddToCart = () => {
    addToCart(product)
    console.log('Cart updated:', cart)
  }

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title>{nombre}</Card.Title>
          <Badge bg="secondary">{categoria}</Badge>
        </div>
        <Card.Text className="text-muted flex-grow-1">
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