import { useState, useEffect, useContext } from 'react'
import { Container, Table, Badge, Alert, Spinner, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const OrdersHistory = () => {

  const { fetchWithAuth } = useContext(AuthContext)
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
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
    const fetchOrders = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:3000/orders')
        if (!response.ok) throw new Error('Error al obtener los pedidos')
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando tus pedidos...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Mis pedidos</h2>

      {orders.length === 0 ? (
        <Alert variant="info">
          No tenés pedidos realizados todavía.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>N° Pedido</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  <Badge bg={getStatusVariant(order.estado)}>
                    {order.estado}
                  </Badge>
                </td>
                <td>${order.total.toLocaleString()}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Ver detalle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}

export default OrdersHistory