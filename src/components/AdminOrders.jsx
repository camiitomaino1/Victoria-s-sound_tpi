import { useState, useEffect, useContext } from 'react'
import { Table, Form, Badge, Spinner, Alert, Row, Col, Button, Modal, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const AdminOrders = () => {

  const { fetchWithAuth } = useContext(AuthContext)
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [dateOrder, setDateOrder] = useState('newest')
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const statusOptions = ['pendiente', 'confirmado', 'enviado', 'entregado']

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
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

  const getStatusVariant = (estado) => {
    const variants = {
      pendiente: 'warning',
      confirmado: 'info',
      enviado: 'primary',
      entregado: 'success'
    }
    return variants[estado] || 'secondary'
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    setFeedback(null)

    try {
      const response = await fetchWithAuth(`http://localhost:3000/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

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

  const handleDeleteClick = (order) => {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setOrderToDelete(null)
    setShowDeleteModal(false)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    setFeedback(null)

    try {
      const response = await fetchWithAuth(`http://localhost:3000/orders/${orderToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setOrders(orders.filter((o) => o.id !== orderToDelete.id))
      setFeedback({ type: 'success', message: `Pedido #${orderToDelete.id} eliminado correctamente` })
      handleCloseDeleteModal()
    } catch (err) {
      setFeedback({ type: 'danger', message: 'No fue posible eliminar el pedido. Intentá de nuevo.' })
    } finally {
      setDeleting(false)
    }
  }

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch = order.id.toString().includes(search.trim())
      const matchesStatus = selectedStatus === 'Todos' || order.estado === selectedStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" variant="dark" />
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <div>

      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {/* Filters row */}
      <Row className="mb-4 g-3 align-items-end">

        {/* Search by order id with icon */}
        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Buscar por número de pedido</Form.Label>
          <InputGroup>
            <InputGroup.Text className="input-group-icon">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Ej: 12, 7, 23..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        {/* Filter by status */}
        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Estado del pedido</Form.Label>
          <Form.Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Col>

        {/* Sort by date */}
        <Col md={4}>
          <Form.Label className="small fw-bold mb-1">Ordenar por fecha</Form.Label>
          <Form.Select
            value={dateOrder}
            onChange={(e) => setDateOrder(e.target.value)}
          >
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
          </Form.Select>
        </Col>

      </Row>

      {/* Results counter */}
      <p className="text-muted small mb-3">
        Mostrando {filteredAndSortedOrders.length} de {orders.length} pedidos
      </p>

      {filteredAndSortedOrders.length === 0 && (
        <Alert variant="info">No se encontraron pedidos con ese criterio.</Alert>
      )}

      {filteredAndSortedOrders.length > 0 && (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>N° Pedido</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.User ? order.User.nombre : 'Usuario eliminado'}</td>
                <td>${order.total.toLocaleString()}</td>
                <td>
                  <Badge bg={getStatusVariant(order.estado)}>{order.estado}</Badge>
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      Ver detalle
                    </Button>
                    <Form.Select
                      size="sm"
                      value={order.estado}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="select-auto-width"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                    {updatingId === order.id && (
                      <Spinner animation="border" size="sm" />
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(order)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToDelete && (
            <p>
              ¿Estás seguro de que querés eliminar el pedido{' '}
              <strong>#{orderToDelete.id}</strong>?{' '}
              Esta acción no se puede deshacer.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default AdminOrders