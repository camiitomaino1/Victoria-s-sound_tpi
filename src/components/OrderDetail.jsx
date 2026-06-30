import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Card, Badge, Button, Spinner, Alert, Row, Col, Table } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const OrderDetail = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchWithAuth } = useContext(AuthContext)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getStatusVariant = (estado) => {
    const variants = {
      pendiente: 'warning',
      confirmado: 'info',
      enviado: 'primary',
      entregado: 'success'
    }
    return variants[estado] || 'secondary'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:3000/orders/${id}`)
        if (!response.ok) throw new Error('Pedido no encontrado')
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando pedido...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="dark" onClick={() => navigate(-1)}>Volver</Button>
      </Container>
    )
  }

  // OrderItems may be empty for orders created before this feature was implemented
  const items = order.OrderItems || []

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Detalle del pedido #{order.id}</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">

            <Col md={6}>
              <p className="order-detail-label mb-1">Número de pedido</p>
              <p className="order-detail-value fs-5">#{order.id}</p>
            </Col>

            <Col md={6}>
              <p className="order-detail-label mb-1">Fecha</p>
              <p className="order-detail-value">{formatDate(order.createdAt)}</p>
            </Col>

            <Col md={6}>
              <p className="order-detail-label mb-1">Estado</p>
              <Badge bg={getStatusVariant(order.estado)} className="fs-6">
                {order.estado}
              </Badge>
            </Col>

            <Col md={6}>
              <p className="order-detail-label mb-1">Total</p>
              <p className="order-detail-value fs-5">${order.total.toLocaleString()}</p>
            </Col>

            {order.User && (
              <>
                <Col md={6}>
                  <p className="order-detail-label mb-1">Cliente</p>
                  <p className="order-detail-value">{order.User.nombre}</p>
                </Col>
                <Col md={6}>
                  <p className="order-detail-label mb-1">Email</p>
                  <p className="order-detail-value">{order.User.email}</p>
                </Col>
              </>
            )}

          </Row>
        </Card.Body>
      </Card>

      {/* Products table: only shown if the order has items */}
      {items.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Header>
            <span className="order-detail-value">Productos del pedido</span>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Producto</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombreProducto}</td>
                    <td>${item.precioUnitario.toLocaleString()}</td>
                    <td>{item.cantidad}</td>
                    <td>${(item.precioUnitario * item.cantidad).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          Este pedido no tiene detalle de productos disponible.
        </Alert>
      )}

      <div className="mt-4">
        <Button variant="dark" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

    </Container>
  )
}

export default OrderDetail