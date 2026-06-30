import { useContext, useState } from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

const ProductCard = ({ id, nombre, marca, categoria, precio, descripcion, imagen, stock, isFavorite, onToggleFavorite }) => {

  const { addToCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  const product = { id, nombre, marca, categoria, precio, descripcion, imagen, stock }

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  return (
    <Card className="h-100 shadow-sm">

      <Link to={`/products/${id}`}>
        <Card.Img
          variant="top"
          src={imagen || 'https://placehold.co/400x200?text=Sin+imagen'}
          alt={nombre}
          className="product-card-img"
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">
            <Link to={`/products/${id}`} className="text-dark text-decoration-none">
              {nombre}
            </Link>
          </Card.Title>
          <Badge bg="secondary" className="ms-2">{categoria}</Badge>
        </div>

        <p className="text-muted small mb-2">{marca}</p>

        <Card.Text className="flex-grow-1">{descripcion}</Card.Text>

        <div className="mb-2">
          <Badge bg={stock === 0 ? 'danger' : stock <= 10 ? 'warning' : 'success'}>
            {stock === 0 ? 'Sin stock' : `Stock: ${stock}`}
          </Badge>
        </div>

        <div className="mt-2 d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5">${precio.toLocaleString()}</span>
          <div className="d-flex gap-2">
            {/* Favorite button: only shown for logged-in users */}
            {user && (
              <Button
                variant={isFavorite ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={onToggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </Button>
            )}
            <Button
              variant="dark"
              size="sm"
              onClick={handleAddToCart}
              disabled={stock === 0}
            >
              {stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard