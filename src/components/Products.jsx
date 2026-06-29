import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, ButtonGroup, Button, Spinner, Alert } from 'react-bootstrap'
import ProductCard from './ProductCard'

const Products = () => {

  // State for products fetched from the API
  const [products, setProducts] = useState([])

  // State for loading indicator
  const [loading, setLoading] = useState(true)

  // State for error handling
  const [error, setError] = useState(null)

  // State for the search input
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedBrand, setSelectedBrand] = useState('Todas')
  const [selectedPrice, setSelectedPrice] = useState('Todos')

  // Fetch products from the API when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products')

        // If the server responded with an error status, throw an error
        if (!response.ok) {
          throw new Error('Error al obtener los productos')
        }

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        setError(error.message)
      } finally {
        // Always stop the loading indicator, whether it succeeded or failed
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Extract unique categories from the fetched products and add "Todas"
  const categories = ['Todas', ...new Set(products.map((p) => p.categoria))]

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

  // Apply both filters combined: search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory
    const matchesBrand = selectedBrand === 'Todas' || product.marca === selectedBrand
    const matchesPrice = activePriceRange ? activePriceRange.filter(product.precio) : true
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice
  })

  // Show loading spinner while fetching
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando productos...</p>
      </Container>
    )
  }

  // Show error message if the fetch failed
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

      <Row className="mb-4 g-3 align-items-end">

        {/* Search by name with icon */}
        <Col md={3}>
          <Form.Label className="small fw-bold mb-1">Buscar por nombre</Form.Label>
          <InputGroup>
            <InputGroup.Text className="input-group-icon">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Ej: Guitarra, Piano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        {/* Filter by category */}
        <Col md={3}>
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

        {/* Filter by brand */}
        <Col md={3}>
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

        {/* Filter by price range */}
        <Col md={3}>
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

      {/* Reset filters and results counter */}
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
            />
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default Products