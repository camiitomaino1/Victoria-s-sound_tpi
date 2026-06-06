import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Navbar as BsNavbar, Nav, Container, Badge } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const Navbar = () => {

  // Connect to CartContext to read the cart state
  const { cart } = useContext(CartContext)

  // Calculate total number of items across all products
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BsNavbar.Brand as={Link} to="/">🎸 Victoria's Sound</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/products">Productos</Nav.Link>

            {/* Cart link with item counter badge */}
            <Nav.Link as={Link} to="/cart">
              Carrito{' '}
              {totalItems > 0 && (
                <Badge bg="danger" pill>
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>

            <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
            <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}

export default Navbar