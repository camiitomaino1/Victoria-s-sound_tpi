import { useLocation, useNavigate } from 'react-router-dom'
import { Container, Table, Badge, Button, Alert, Row, Col } from 'react-bootstrap'

const OrderSummary = () => {

  const { state } = useLocation()
  const navigate = useNavigate()

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

  const { items, total, orderId, shippingMethod, paymentMethod, shippingAddress } = state

  const shippingLabels = {
    domicilio: 'Envío a domicilio',
    retiro: 'Retiro en tienda'
  }

  const paymentLabels = {
    tarjeta: 'Tarjeta de crédito/débito',
    efectivo: 'Efectivo',
    transferencia: 'Transferencia bancaria'
  }

  return (
    <Container className="mt-4">

      <div className="text-center mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
        <h2 className="mt-3">¡Compra realizada con éxito!</h2>
        <p className="text-muted">Número de pedido: <strong>#{orderId}</strong></p>
      </div>

      {(shippingMethod || paymentMethod) && (
        <Row className="mb-2 g-3">
          {shippingMethod && (
            <Col md={6}>
              <p className="order-detail-label mb-1">Método de envío</p>
              <p className="order-detail-value">
                <i className="bi bi-truck me-2"></i>
                {shippingLabels[shippingMethod]}
              </p>
            </Col>
          )}
          {paymentMethod && (
            <Col md={6}>
              <p className="order-detail-label mb-1">Método de pago</p>
              <p className="order-detail-value">
                <i className="bi bi-credit-card me-2"></i>
                {paymentLabels[paymentMethod]}
              </p>
            </Col>
          )}
        </Row>
      )}

      {shippingAddress && (
        <Row className="mb-4">
          <Col>
            <p className="order-detail-label mb-1">
              {shippingMethod === 'retiro' ? 'Dirección de retiro' : 'Dirección de entrega'}
            </p>
            <p className="order-detail-value">
              <i className="bi bi-geo-alt me-2"></i>
              {shippingAddress}
            </p>
          </Col>
        </Row>
      )}

      <h5 className="mb-3">Resumen de tu pedido</h5>

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

      <div className="d-flex flex-column align-items-end gap-2 mb-4">
        <h5>
          Total abonado: <strong>${total.toLocaleString()}</strong>
        </h5>
      </div>

      <div className="d-flex justify-content-center">
        <Button variant="dark" onClick={() => navigate('/products')}>
          Seguir comprando
        </Button>
      </div>

    </Container>
  )
}

export default OrderSummary