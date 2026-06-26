import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, ButtonGroup, Button, Spinner, Alert } from 'react-bootstrap'
import ProductCard from './ProductCard'

const Products = () => {

  // State for products fetched from the API
  const [products, setProducts] = useState([])

  // Loading state while fetching
  const [loading, setLoading] = useState(true)

  // Error state if the fetch fails
  const [error, setError] = useState(null)

  // State for the search input
  const [search, setSearch] = useState('')

  // State for the selected category filter
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  // State for the selected brand filter
  const [selectedBrand, setSelectedBrand] = useState('Todas')

  // State for the selected price range filter
  const [selectedPrice, setSelectedPrice] = useState('Todos')

  // Price range options: label shown to user and filter function
  const priceRanges = [
    {
      label: 'Todos',
      value: 'Todos',
      filter: () => true
    },
    {
      label: 'Menor a $1.000',
      value: 'lt1000',
      filter: (precio) => precio < 1000
    },
    {
      label: '$1.000 - $2.000',
      value: '1000to2000',
      filter: (precio) => precio >= 1000 && precio <= 2000
    },
    {
      label: '$2.000 - $3.500',
      value: '2000to3500',
      filter: (precio) => precio > 2000 && precio <= 3500
    },
    {
      label: 'Mayor a $3.500',
      value: 'gt3500',
      filter: (precio) => precio > 3500
    }
  ]

  // Fetch products from the API when the component mounts
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

  // Extract unique categories from products and add "Todas" at the beginning
  const categories = ['Todas', ...new Set(products.map((p) => p.categoria))]

  // Extract unique brands from products and add "Todas" at the beginning
  const brands = ['Todas', ...new Set(products.map((p) => p.marca))]

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // Handler for category button clicks
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  // Handler for brand select changes
  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value)
  }

  // Handler for price range select changes
  const handlePriceChange = (e) => {
    setSelectedPrice(e.target.value)
  }

  // Reset all filters to their default values
  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('Todas')
    setSelectedBrand('Todas')
    setSelectedPrice('Todos')
  }

  // Find the active price range filter function
  const activePriceRange = priceRanges.find((r) => r.value === selectedPrice)

  // Apply all filters combined: search, category, brand and price range
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory
    const matchesBrand = selectedBrand === 'Todas' || product.marca === selectedBrand
    const matchesPrice = activePriceRange ? activePriceRange.filter(product.precio) : true
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice
  })

  // Check if any filter is currently active
  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'Todas' ||
    selectedBrand !== 'Todas' ||
    selectedPrice !== 'Todos'

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

      {/* Search input */}
      <Form.Control
        type="text"
        placeholder="Buscar instrumento..."
        value={search}
        onChange={handleSearchChange}
        className="mb-3"
      />

      {/* Brand and price filters in the same row */}
      <Row className="mb-3 g-2">
        <Col md={6}>
          <Form.Select value={selectedBrand} onChange={handleBrandChange}>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand === 'Todas' ? 'Todas las marcas' : brand}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select value={selectedPrice} onChange={handlePriceChange}>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Category filter buttons */}
      <ButtonGroup className="mb-3 flex-wrap">
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

      {/* Reset filters button: only visible when at least one filter is active */}
      {hasActiveFilters && (
        <div className="mb-4">
          <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* No results message */}
      {filteredProducts.length === 0 && (
        <Alert variant="info">
          No se encontraron instrumentos con ese criterio.
        </Alert>
      )}

      {/* Products grid */}
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