import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, InputGroup, Spinner, Alert } from 'react-bootstrap'
import ProductCard from './ProductCard'

const Products = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedBrand, setSelectedBrand] = useState('Todas')
  const [selectedPrice, setSelectedPrice] = useState('Todos')

  const priceRanges = [
    { label: 'Todos los precios', value: 'Todos', filter: () => true },
    { label: 'Menor a $1.000', value: 'lt1000', filter: (precio) => precio < 1000 },
    { label: '$1.000 - $2.000', value: '1000to2000', filter: (precio) => precio >= 1000 && precio <= 2000 },
    { label: '$2.000 - $3.500', value: '2000to3500', filter: (precio) => precio > 2000 && precio <= 3500 },
    { label: 'Mayor a $3.500', value: 'gt3500', filter: (precio) => precio > 3500 }
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products')
        if (!response.ok) throw new Error('Error al obtener los productos')
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categories = ['Todas', ...new Set(products.map((p) => p.categoria))]
  const brands = ['Todas', ...new Set(products.map((p) => p.marca))]

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('Todas')
    setSelectedBrand('Todas')
    setSelectedPrice('Todos')
  }

  const activePriceRange = priceRanges.find((r) => r.value === selectedPrice)

  // Search matches name, category OR brand simultaneously
  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchLower) ||
      product.categoria.toLowerCase().includes(searchLower) ||
      product.marca.toLowerCase().includes(searchLower)
    const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory
    const matchesBrand = selectedBrand === 'Todas' || product.marca === selectedBrand
    const matchesPrice = activePriceRange ? activePriceRange.filter(product.precio) : true
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice
  })

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'Todas' ||
    selectedBrand !== 'Todas' ||
    selectedPrice !== 'Todos'

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando productos...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          No se pudieron cargar los productos. Verificá que el servidor esté funcionando.
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Nuestros Instrumentos</h2>

      {/* Search bar on top, searches by name, category and brand */}
      <InputGroup className="mb-3">
        <InputGroup.Text className="input-group-icon">
          <i className="bi bi-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Buscar por nombre, categoría o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Secondary filters row */}
      <Row className="mb-4 g-3 align-items-end">

        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Categoría</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'Todas' ? 'Todas las categorías' : category}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Marca</Form.Label>
          <Form.Select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand === 'Todas' ? 'Todas las marcas' : brand}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Rango de precio</Form.Label>
          <Form.Select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Form.Select>
        </Col>

      </Row>

      {/* Results counter and reset button */}
      {hasActiveFilters && (
        <div className="mb-4 d-flex align-items-center gap-3">
          <span className="text-muted small">
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleResetFilters}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Alert variant="info">
          No se encontraron instrumentos con ese criterio.
        </Alert>
      )}

      <Row xs={1} sm={2} lg={3} className="g-4">
        {filteredProducts.map((product) => (
          <Col key={product.id}>
            <ProductCard
              id={product.id}
              nombre={product.nombre}
              marca={product.marca}
              categoria={product.categoria}
              precio={product.precio}
              descripcion={product.descripcion}
              imagen={product.imagen}
              stock={product.stock}
            />
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Products