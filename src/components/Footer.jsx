import { Container, Row, Col } from 'react-bootstrap'
import logo from '../assets/logo.png'
import logoUTN from '../assets/logoutn.png'

const Footer = () => {
  return (
    <footer className="mt-5 py-5">
      <Container>
        <Row className="align-items-center gy-4">

          {/* Left: Victoria's Sound logo in white */}
          <Col md={4} className="text-center text-md-start">
            <img
              src={logo}
              alt="Victoria's Sound"
              className="footer-logo-store mb-2"
            />
            <p className="footer-tagline">Tu Pasión, Nuestro Sonido</p>
          </Col>

          {/* Center: academic info */}
          <Col md={4} className="text-center">
            <p className="footer-title mb-1">Trabajo Práctico Integrador</p>
            <p className="footer-subtitle mb-1">Programación III</p>
            <p className="footer-subtitle mb-1">Camila Tomaino</p>
            <p className="footer-copy mt-2 mb-0">© 2026 Victoria's Sound</p>
          </Col>

          {/* Right: UTN logo */}
          <Col md={4} className="text-center text-md-end">
            <img
              src={logoUTN}
              alt="UTN FRRO"
              className="footer-logo-utn mb-2"
            />
            <p className="footer-subtitle mb-0">UTN FRRO</p>
          </Col>

        </Row>
      </Container>
    </footer>
  )
}

export default Footer