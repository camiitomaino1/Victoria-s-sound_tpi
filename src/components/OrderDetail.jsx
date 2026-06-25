import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Card, Badge, Button, Spinner, Alert, Row, Col } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const OrderDetail = () => {

  // Get the order id from the URL
  const { id } = useParams()
  const navigate = useNavigate()

  // Get the token from AuthContext
  const { token } = useContext(AuthContext)

  // State for the order data
  const [order, setOrder] = useState(null)

  // Loading state while fetching
  const [loading, setLoading] = useState(true)

  // Error state if the fetch fails
  const [error, setError] = useState(null)

  // Returns a Bootstrap badge color depending on the order status
  const getStatusVariant = (estado) => {
    const variants = {
      pendiente: 'warning',
      confirmado: 'info',
      enviado: 'primary',
      entregado: 'success'
    }
    return variants[estado] || 'secondary'
  }

  // Format date string to a readable format
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

  // Fetch the order when the component mounts
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:3000/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Pedido no encontrado')
        }

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

  // Show loading spinner while fetching
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando pedido...</p>
      </Container>
    )
  }

  // Show error message if the fetch failed
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="dark" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Detalle del pedido #{order.id}</h2>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="g-3">

            <Col md={6}>
              <p className="mb-1 text-muted">Número de pedido</p>
              <p className="fw-bold fs-5">#{order.id}</p>
            </Col>

            <Col md={6}>
              <p className="mb-1 text-muted">Fecha</p>
              <p className="fw-bold">{formatDate(order.createdAt)}</p>
            </Col>

            <Col md={6}>
              <p className="mb-1 text-muted">Estado</p>
              <Badge bg={getStatusVariant(order.estado)} className="fs-6">
                {order.estado}
              </Badge>
            </Col>

            <Col md={6}>
              <p className="mb-1 text-muted">Total</p>
              <p className="fw-bold fs-5">${order.total.toLocaleString()}</p>
            </Col>

            {/* Show user info if available (admin/sysadmin view) */}
            {order.User && (
              <>
                <Col md={6}>
                  <p className="mb-1 text-muted">Cliente</p>
                  <p className="fw-bold">{order.User.nombre}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">Email</p>
                  <p className="fw-bold">{order.User.email}</p>
                </Col>
              </>
            )}

          </Row>
        </Card.Body>
      </Card>

      {/* Back button: goes back to wherever the user came from */}
      <div className="mt-4">
        <Button variant="dark" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

    </Container>
  )
}

export default OrderDetail