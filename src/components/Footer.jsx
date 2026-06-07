import { Container } from 'react-bootstrap'

const Footer = () => {
  return (
    // Main footer wrapper with dark background and top border for visual separation
    <footer className="bg-dark text-light mt-5 py-4 border-top border-secondary">
      <Container className="text-center">

        {/* Store name */}
        <p className="fw-bold mb-1">🎸 Victoria's Sound</p>

        {/* Academic information */}
        <p className="mb-1 text-secondary">
          Trabajo Práctico Integrador — Programación III
        </p>
        <p className="mb-1 text-secondary">Camila Tomaino</p>
        <p className="mb-2 text-secondary">UTN FRRO</p>

        {/* Copyright */}
        <p className="mb-0 small text-secondary">© 2026</p>

      </Container>
    </footer>
  )
}

export default Footer