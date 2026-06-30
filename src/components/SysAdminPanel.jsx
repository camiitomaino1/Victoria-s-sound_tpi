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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const [formData, setFormData] = useState({ nombre: '', email: '', role: 'user' })
  const [createFormData, setCreateFormData] = useState({
    nombre: '', email: '', password: '', role: 'user'
  })

  const [touched, setTouched] = useState({})
  const [createTouched, setCreateTouched] = useState({})

  const roleOptions = ['user', 'admin', 'sysadmin']

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const isNombreValid = (value) => value.trim().length >= 2
  const isEmailValid = (value) => emailRegex.test(value)
  const isPasswordValid = (value) => passwordRegex.test(value)

  const isEditFormValid = () => isNombreValid(formData.nombre) && isEmailValid(formData.email)
  const isCreateFormValid = () =>
    isNombreValid(createFormData.nombre) &&
    isEmailValid(createFormData.email) &&
    isPasswordValid(createFormData.password)

  const capitalizeWords = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase())
  }

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

  // Edit modal handlers
  const handleEditClick = (user) => {
    setEditingUser(user)
    setFormData({ nombre: user.nombre, email: user.email, role: user.role })
    setTouched({})
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingUser(null)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'nombre' ? capitalizeWords(value) : value
    })
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setTouched({ nombre: true, email: true })

    if (!isEditFormValid()) {
      setFeedback({ type: 'danger', message: 'Revisá los campos marcados en rojo antes de continuar.' })
      return
    }

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

  // Create modal handlers
  const handleOpenCreateModal = () => {
    setCreateFormData({ nombre: '', email: '', password: '', role: 'user' })
    setCreateTouched({})
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target
    setCreateFormData({
      ...createFormData,
      [name]: name === 'nombre' ? capitalizeWords(value) : value
    })
  }

  const handleCreateBlur = (field) => {
    setCreateTouched({ ...createTouched, [field]: true })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateTouched({ nombre: true, email: true, password: true })

    if (!isCreateFormValid()) {
      setFeedback({ type: 'danger', message: 'Revisá los campos marcados en rojo antes de continuar.' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetchWithAuth('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setFeedback({ type: 'success', message: `Usuario ${data.nombre} creado correctamente` })
      handleCloseCreateModal()
      fetchUsers()
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Delete modal handlers
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
      setUsers(users.map((u) => u.id === userToDelete.id ? { ...u, activo: false } : u))
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
      setUsers(users.map((u) => u.id === user.id ? { ...u, activo: true } : u))
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
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Check
          type="switch"
          label="Mostrar usuarios inactivos"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
        <Button variant="dark" onClick={handleOpenCreateModal}>
          <i className="bi bi-person-plus-fill me-1"></i> Nuevo usuario
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th>
            <th>Rol</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map((user) => (
            <tr key={user.id} className={!user.activo ? 'table-secondary' : ''}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td><Badge bg={getRoleVariant(user.role)}>{user.role}</Badge></td>
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

      {/* Edit user modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Form onSubmit={handleEditSubmit} noValidate>
          <Modal.Header closeButton>
            <Modal.Title>Editar usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre <span className="required-asterisk">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
                onBlur={() => handleBlur('nombre')}
                isInvalid={touched.nombre && !isNombreValid(formData.nombre)}
                isValid={touched.nombre && isNombreValid(formData.nombre)}
              />
              <Form.Control.Feedback type="invalid">
                El nombre debe tener al menos 2 caracteres.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email <span className="required-asterisk">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                onBlur={() => handleBlur('email')}
                isInvalid={touched.email && !isEmailValid(formData.email)}
                isValid={touched.email && isEmailValid(formData.email)}
              />
              <Form.Control.Feedback type="invalid">
                Ingresá un email válido.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol <span className="required-asterisk">*</span></Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleFormChange} required>
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
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

      {/* Create user modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Form onSubmit={handleCreateSubmit} noValidate>
          <Modal.Header closeButton>
            <Modal.Title>Nuevo usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre <span className="required-asterisk">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={createFormData.nombre}
                onChange={handleCreateFormChange}
                onBlur={() => handleCreateBlur('nombre')}
                isInvalid={createTouched.nombre && !isNombreValid(createFormData.nombre)}
                isValid={createTouched.nombre && isNombreValid(createFormData.nombre)}
              />
              <Form.Control.Feedback type="invalid">
                El nombre debe tener al menos 2 caracteres.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email <span className="required-asterisk">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={createFormData.email}
                onChange={handleCreateFormChange}
                onBlur={() => handleCreateBlur('email')}
                isInvalid={createTouched.email && !isEmailValid(createFormData.email)}
                isValid={createTouched.email && isEmailValid(createFormData.email)}
              />
              <Form.Control.Feedback type="invalid">
                Ingresá un email válido.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña <span className="required-asterisk">*</span></Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="••••••••"
                value={createFormData.password}
                onChange={handleCreateFormChange}
                onBlur={() => handleCreateBlur('password')}
                isInvalid={createTouched.password && !isPasswordValid(createFormData.password)}
                isValid={createTouched.password && isPasswordValid(createFormData.password)}
              />
              <Form.Control.Feedback type="invalid">
                Debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial.
              </Form.Control.Feedback>
              <Form.Text className="password-hint">
                Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol <span className="required-asterisk">*</span></Form.Label>
              <Form.Select name="role" value={createFormData.role} onChange={handleCreateFormChange} required>
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreateModal}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Crear usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete user modal */}
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