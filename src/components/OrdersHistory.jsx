import { useState, useEffect, useContext } from 'react'
import { Container, Table, Badge, Alert, Spinner, Button } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const OrdersHistory = () => {

  // Get the token to authenticate requests
  const { token } = useContext(AuthContext)

  // State for the list of orders
  const [orders, setOrders] = useState([])

  // Loading state while fetching orders
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

  // Fetch orders when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:3000/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

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

  // Show loading spinner while fetching
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando tus pedidos...</p>
      </Container>
    )
  }

  // Show error message if the fetch failed
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

      {/* Empty state message */}
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
                  {/* Detail button: prepared for future implementation */}
                  <Button
                    variant="outline-dark"
                    size="sm"
                    disabled
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