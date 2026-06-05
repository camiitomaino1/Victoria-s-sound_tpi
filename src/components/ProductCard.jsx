import { Card, Badge, Button } from 'react-bootstrap'

const ProductCard = ({ nombre, categoria, precio, descripcion }) => {
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
          <Button variant="dark" size="sm">Agregar al carrito</Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard