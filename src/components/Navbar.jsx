import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar as BsNavbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import useTheme from '../hooks/useTheme'
import logo from '../assets/logo.png'

const Navbar = () => {

  const { cart } = useContext(CartContext)
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <BsNavbar expand="lg" fixed="top">
      <Container>

        <BsNavbar.Brand as={Link} to="/">
          <img src={logo} alt="Victoria's Sound" />
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">

            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/products">Productos</Nav.Link>

            {/* Cart icon with badge positioned over the icon */}
            <Nav.Link as={Link} to="/cart">
              <span className="cart-icon-wrapper">
                <i className="bi bi-cart3 fs-5"></i>
                {totalItems > 0 && (
                  <Badge className="cart-badge">{totalItems}</Badge>
                )}
              </span>
            </Nav.Link>

            {/* Theme toggle button */}
            <Nav.Link onClick={toggleTheme} title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}>
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'} fs-5`}></i>
            </Nav.Link>

            {/* Admin panel link: admin and sysadmin only */}
            {user && (user.role === 'admin' || user.role === 'sysadmin') && (
              <Nav.Link as={Link} to="/admin">
                <i className="bi bi-gear-fill"></i> Panel Admin
              </Nav.Link>
            )}

            {/* Users management link: sysadmin only */}
            {user && user.role === 'sysadmin' && (
              <Nav.Link as={Link} to="/admin/users">
                <i className="bi bi-people-fill"></i> Usuarios
              </Nav.Link>
            )}

            {/* User dropdown or login/register links */}
            {user ? (
              <NavDropdown
                title={<span>👤 {user.nombre}</span>}
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Mi perfil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mis-pedidos">
                  Mis pedidos
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/favorites">
                  <i className="bi bi-heart-fill me-1 text-danger"></i>
                  Mis favoritos
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}

          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}

export default Navbar