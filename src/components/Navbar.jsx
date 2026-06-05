import { Link } from 'react-router-dom'
import { Navbar as BsNavbar, Nav, Container } from 'react-bootstrap'

const Navbar = () => {
  return (
    <BsNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BsNavbar.Brand as={Link} to="/">Victoria´s Sound</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/products">Productos</Nav.Link>
            <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
            <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}

export default Navbar