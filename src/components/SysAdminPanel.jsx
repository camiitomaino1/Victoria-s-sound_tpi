import { useState, useEffect, useContext } from 'react'
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const SysAdminPanel = () => {

  const { fetchWithAuth } = useContext(AuthContext)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', email: '', role: 'user' })

  const roleOptions = ['user', 'admin', 'sysadmin']

  const getRoleVariant = (role) => {
    const variants = { user: 'secondary', admin: 'primary', sysadmin: 'danger' }
    return variants[role] || 'secondary'
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth('http://localhost:3000/users')
      if (!response.ok) throw new Error('Error al obtener los usuarios')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setFormData({ nombre: user.nombre, email: user.email, role: user.role })
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingUser(null)
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetchWithAuth(`http://localhost:3000/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

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

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleConfirmDelete = async () => {
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetchWithAuth(`http://localhost:3000/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setUsers(users.map((u) =>
        u.id === userToDelete.id ? { ...u, activo: false } : u
      ))

      setFeedback({ type: 'success', message: 'Usuario desactivado correctamente' })
      handleCloseDeleteModal()
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleRestore = async (user) => {
    setFeedback(null)
    try {
      const response = await fetchWithAuth(`http://localhost:3000/users/${user.id}/restore`, {
        method: 'PATCH'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setUsers(users.map((u) =>
        u.id === user.id ? { ...u, activo: true } : u
      ))

      setFeedback({ type: 'success', message: 'Usuario reactivado correctamente' })
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando usuarios...</p>
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

  const displayedUsers = showInactive ? users : users.filter((u) => u.activo)

  return (
    <Container className="mt-4">
      <h2 className="mb-4">
        <i className="bi bi-people-fill"></i> Administración de Usuarios
      </h2>

      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <div className="mb-3">
        <Form.Check
          type="switch"
          label="Mostrar usuarios inactivos"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map((user) => (
            <tr key={user.id} className={!user.activo ? 'table-secondary' : ''}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getRoleVariant(user.role)}>{user.role}</Badge>
              </td>
              <td>
                <Badge bg={user.activo ? 'success' : 'secondary'}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  {user.activo ? (
                    <>
                      <Button variant="outline-dark" size="sm" onClick={() => handleEditClick(user)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(user)}>
                        Desactivar
                      </Button>
                    </>
                  ) : (
                    <Button variant="success" size="sm" onClick={() => handleRestore(user)}>
                      Reactivar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Editar usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleFormChange} required>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Desactivar usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>
              ¿Estás seguro de que querés desactivar al usuario{' '}
              <strong>{userToDelete.nombre}</strong>?
              El usuario no podrá iniciar sesión, pero sus datos se conservarán.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
            {saving ? 'Desactivando...' : 'Desactivar'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default SysAdminPanel