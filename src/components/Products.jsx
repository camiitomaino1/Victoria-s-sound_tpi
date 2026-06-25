import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  ButtonGroup,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import ProductCard from "./ProductCard";

const Products = () => {
  // State for products fetched from the API
  const [products, setProducts] = useState([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for error handling
  const [error, setError] = useState(null);

  // State for the search input
  const [search, setSearch] = useState("");

  // State for the selected category filter
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Fetch products from the API when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/products");

        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique categories from the fetched products and add "Todas"
  const categories = ["Todas", ...new Set(products.map((p) => p.categoria))];

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handler for category button clicks
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Apply both filters combined: search and category
  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();

    const matchesSearch =
      product.nombre.toLowerCase().includes(term) ||
      product.categoria.toLowerCase().includes(term) ||
      product.marca.toLowerCase().includes(term) ||
      product.descripcion.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "Todas" || product.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Show loading spinner while fetching
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando productos...</p>
      </Container>
    );
  }

  // Show error message if the fetch failed
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          No se pudieron cargar los productos. Verificá que el servidor esté
          funcionando.
        </Alert>
      </Container>
    );
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

      {/* Category filter buttons */}
      <ButtonGroup className="mb-4 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "dark" : "outline-dark"}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </Button>
        ))}
      </ButtonGroup>

      {/* No results message */}
      {filteredProducts.length === 0 && (
        <p className="text-muted">
          No se encontraron instrumentos con ese criterio.
        </p>
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
  );
};

export default Products;
