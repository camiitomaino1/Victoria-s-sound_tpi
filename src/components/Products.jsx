import { Container, Row, Col } from 'react-bootstrap'
import productsData from '../data/productsData'
import ProductCard from './ProductCard'

const Products = () => {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Nuestros Instrumentos</h2>
      <Row xs={1} sm={2} lg={3} className="g-4">
        {productsData.map((producto) => (
          <Col key={producto.id}>
            <ProductCard
              nombre={producto.nombre}
              categoria={producto.categoria}
              precio={producto.precio}
              descripcion={producto.descripcion}
            />
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Products