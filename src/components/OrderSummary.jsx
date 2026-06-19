import { useLocation, useNavigate } from 'react-router-dom'
import { Container, Table, Badge, Button, Alert } from 'react-bootstrap'

const OrderSummary = () => {

  // Read the data passed from Cart.jsx via navigate state
  const { state } = useLocation()
  const navigate = useNavigate()

  // If the user navigates here directly without completing a purchase, redirect to home
  if (!state || !state.items) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          No hay información de compra disponible.{' '}
          <a href="/">Volver al inicio</a>
        </Alert>
      </Container>
    )
  }

  const { items, total, orderId } = state

  return (
    <Container className="mt-4">

      {/* Success header */}
      <div className="text-center mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
        <h2 className="mt-3">¡Compra realizada con éxito!</h2>
        <p className="text-muted">Número de pedido: <strong>#{orderId}</strong></p>
      </div>

      <h5 className="mb-3">Resumen de tu pedido</h5>

      {/* Order items table */}
      <Table striped bordered responsive>
        <thead className="table-dark">
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio unitario</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>
                <Badge bg="secondary">{item.categoria}</Badge>
              </td>
              <td>${item.precio.toLocaleString()}</td>
              <td>{item.quantity}</td>
              <td>${(item.precio * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Order total */}
      <div className="d-flex flex-column align-items-end gap-2 mb-4">
        <h5>
          Total abonado: <strong>${total.toLocaleString()}</strong>
        </h5>
      </div>

      {/* Navigation buttons */}
      <div className="d-flex justify-content-center gap-3">
        <Button variant="dark" onClick={() => navigate('/products')}>
          Seguir comprando
        </Button>
      </div>

    </Container>
  )
}

export default OrderSummary