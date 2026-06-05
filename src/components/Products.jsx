import { useState } from 'react'
import { Container, Row, Col, Form, ButtonGroup, Button } from 'react-bootstrap'
import productsData from '../data/productsData'
import ProductCard from './ProductCard'

const Products = () => {

  // State for the search input
  const [search, setSearch] = useState('')

  // State for the selected category filter
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  // Extract unique categories from productsData and add "Todas" at the beginning
  const categories = ['Todas', ...new Set(productsData.map((p) => p.categoria))]

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // Handler for category button clicks
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  // Apply both filters combined: search and category
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Nuestros Instrumentos</h2>

      {/* Search input */}
      <Form.Control
        type="text"
        placeholder="Buscar instrumento..."
        value={search}
        onChange={handleSearchChange}
        className="mb-3"
      />

      {/* Category filter buttons */}
      <ButtonGroup className="mb-4 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'dark' : 'outline-dark'}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </ButtonGroup>

      {/* No results message */}
      {filteredProducts.length === 0 && (
        <p className="text-muted">No se encontraron instrumentos con ese criterio.</p>
      )}

      {/* Products grid */}
      <Row xs={1} sm={2} lg={3} className="g-4">
        {filteredProducts.map((product) => (
          <Col key={product.id}>
            <ProductCard
              nombre={product.nombre}
              categoria={product.categoria}
              precio={product.precio}
              descripcion={product.descripcion}
            />
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Products