import { useState, useEffect, useContext } from 'react'
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const SysAdminPanel = () => {

  // Get the token to authenticate requests
  const { token } = useContext(AuthContext)

  // State for the list of users
  const [users, setUsers] = useState([])

  // Loading state for the initial fetch
  const [loading, setLoading] = useState(true)

  // Error state for the initial fetch
  const [error, setError] = useState(null)

  // Feedback message after create/edit/delete
  const [feedback, setFeedback] = useState(null)

  // Controls whether the edit modal is visible
  const [showEditModal, setShowEditModal] = useState(false)

  // Controls whether the delete confirmation modal is visible
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Stores the user being edited
  const [editingUser, setEditingUser] = useState(null)

  // Stores the user selected for deletion
  const [userToDelete, setUserToDelete] = useState(null)

  // Loading state while saving or deleting
  const [saving, setSaving] = useState(false)

  // Form fields for the edit modal
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    role: 'user'
  })

  // Available roles
  const roleOptions = ['user', 'admin', 'sysadmin']

  // Returns a Bootstrap badge color depending on the user role
  const getRoleVariant = (role) => {
    const variants = {
      user: 'secondary',
      admin: 'primary',
      sysadmin: 'danger'
    }
    return variants[role] || 'secondary'
  }

  // Fetch all users when the component mounts
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch users from the protected endpoint
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Error al obtener los usuarios')

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Opens the edit modal with the selected user's data
  const handleEditClick = (user) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      email: user.email,
      role: user.role
    })
    setShowEditModal(true)
  }

  // Closes the edit modal and resets editing state
  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingUser(null)
  }

  // Updates a single form field as the user types
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handles form submission for editing a user
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      // We need to send a password too since the backend requires it for PUT
      // We send the existing hashed password to avoid changing it
      const response = await fetch(`http://localhost:3000/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      // Update the user in local state without refetching
      setUsers(users.map((u) =>
        u.id === editingUser.id
          ? { ...u, nombre: formData.nombre, email: formData.email, role: formData.role }
          : u
      ))

      setFeedback({ type: 'success', message: 'Usuario actualizado correctamente' })
      handleCloseEditModal()

    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Opens the delete confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Closes the delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  // Confirms and executes the deletion
  const handleConfirmDelete = async () => {
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch(`http://localhost:3000/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      // Remove the deleted user from local state
      setUsers(users.filter((u) => u.id !== userToDelete.id))

      setFeedback({ type: 'success', message: `Usuario "${userToDelete.nombre}" eliminado correctamente` })
      handleCloseDeleteModal()

    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Show loading spinner while fetching users
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando usuarios...</p>
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
      <h2 className="mb-4">
        <i className="bi bi-people-fill"></i> Administración de Usuarios
      </h2>

      {/* Feedback message after actions */}
      {feedback && (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Users table */}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getRoleVariant(user.role)}>{user.role}</Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  {/* Edit button */}
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
                    Editar
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit user modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Editar usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                required
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button variant="dark" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>
              ¿Estás seguro de que querés eliminar al usuario{' '}
              <strong>{userToDelete.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default SysAdminPanel