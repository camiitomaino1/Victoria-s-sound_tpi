import { useState, useEffect, useContext } from 'react'
import { Table, Form, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const AdminOrders = () => {

  // Get the token to authenticate requests
  const { token } = useContext(AuthContext)

  // State for the list of orders
  const [orders, setOrders] = useState([])

  // Loading state for the initial fetch
  const [loading, setLoading] = useState(true)

  // Error state for the initial fetch
  const [error, setError] = useState(null)

  // State for the search input (search by order id)
  const [search, setSearch] = useState('')

  // State for the selected status filter
  const [selectedStatus, setSelectedStatus] = useState('Todos')

  // Stores which order id is currently being updated, to show a small spinner on that row
  const [updatingId, setUpdatingId] = useState(null)

  // Feedback message after a status update
  const [feedback, setFeedback] = useState(null)

  // List of possible order statuses
  const statusOptions = ['pendiente', 'confirmado', 'enviado', 'entregado']

  // Fetch all orders when the component mounts
  useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch orders from the protected endpoint
  const fetchOrders = async () => {
    setLoading(true)
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

  // Handler for search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // Handler for status filter changes
  const handleStatusFilterChange = (e) => {
    setSelectedStatus(e.target.value)
  }

  // Handler for changing an order's status from the table
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setFeedback(null)

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Update the order in the local state instead of refetching everything
      setOrders(orders.map((order) =>
        order.id === orderId ? { ...order, estado: newStatus } : order
      ))

      setFeedback({ type: 'success', message: `Pedido #${orderId} actualizado a "${newStatus}"` })

    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  // Apply both filters combined: search by id and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(search)
    const matchesStatus = selectedStatus === 'Todos' || order.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

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

  // Show loading spinner while fetching orders
  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" variant="dark" />
      </div>
    )
  }

  // Show error message if the fetch failed
  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <div>
      {/* Feedback message after status update */}
      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {/* Search and filter controls */}
      <Row className="mb-3 g-2">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por número de pedido..."
            value={search}
            onChange={handleSearchChange}
          />
        </Col>
        <Col md={6}>
          <Form.Select value={selectedStatus} onChange={handleStatusFilterChange}>
            <option value="Todos">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* No results message */}
      {filteredOrders.length === 0 && (
        <Alert variant="info">No se encontraron pedidos con ese criterio.</Alert>
      )}

      {/* Orders table */}
      {filteredOrders.length > 0 && (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>N° Pedido</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Actualizar estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.User ? order.User.nombre : 'Usuario eliminado'}</td>
                <td>${order.total.toLocaleString()}</td>
                <td>
                  <Badge bg={getStatusVariant(order.estado)}>{order.estado}</Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      size="sm"
                      value={order.estado}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      style={{ width: 'auto' }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                    {updatingId === order.id && (
                      <Spinner animation="border" size="sm" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

export default AdminOrders