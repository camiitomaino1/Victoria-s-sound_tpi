import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as BsNavbar,
  Nav,
  Container,
  Badge,
  NavDropdown,
} from "react-bootstrap";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  // Get cart state from CartContext
  const { cart } = useContext(CartContext);

  // Get user and logout function from AuthContext
  const { user, logout } = useContext(AuthContext);

  // Hook to redirect after logout
  const navigate = useNavigate();

  // Calculate total number of items in the cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Handler for logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <BsNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
    >
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          🎸 Victoria's Sound
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-nav" />

        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/products">
              Productos
            </Nav.Link>

            {/* Cart link with item counter badge */}
            <Nav.Link as={Link} to="/cart">
              <i className="bi bi-cart3 fs-5"></i>{" "}
              {totalItems > 0 && (
                <Badge bg="danger" pill>
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>

            {/* Admin panel link */}
            {user &&
              (user.role === "admin" || user.role === "sysadmin") && (
                <Nav.Link as={Link} to="/admin">
                  <i className="bi bi-gear-fill"></i> Panel Admin
                </Nav.Link>
              )}

            {/* Sysadmin users panel */}
            {user && user.role === "sysadmin" && (
              <Nav.Link as={Link} to="/admin/users">
                <i className="bi bi-people-fill"></i> Usuarios
              </Nav.Link>
            )}

            {/* User menu */}
            {user ? (
              <NavDropdown
                title={<span>👤 {user.nombre}</span>}
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/mis-pedidos">
                  Mis pedidos
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Iniciar sesión
                </Nav.Link>

                <Nav.Link as={Link} to="/register">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;