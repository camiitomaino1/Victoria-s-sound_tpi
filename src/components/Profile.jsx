import { useState, useEffect, useContext } from 'react'
import { Container, Card, Row, Col, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Profile = () => {

  const { fetchWithAuth } = useContext(AuthContext)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [profileForm, setProfileForm] = useState({ nombre: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileFeedback, setProfileFeedback] = useState(null)
  const [passwordFeedback, setPasswordFeedback] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const getRoleVariant = (role) => {
    const variants = { user: 'secondary', admin: 'primary', sysadmin: 'danger' }
    return variants[role] || 'secondary'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:3000/users/me')
        if (!response.ok) throw new Error('Error al obtener el perfil')
        const data = await response.json()
        setProfile(data)
        setProfileForm({ nombre: data.nombre, email: data.email })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileFeedback(null)

    try {
      const response = await fetchWithAuth('http://localhost:3000/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setProfile(data)
      setEditingProfile(false)
      setProfileFeedback({ type: 'success', message: 'Perfil actualizado correctamente' })
    } catch (err) {
      setProfileFeedback({ type: 'danger', message: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'danger', message: 'Las contraseñas nuevas no coinciden' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'danger', message: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    setSavingPassword(true)

    try {
      const response = await fetchWithAuth('http://localhost:3000/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setEditingPassword(false)
      setPasswordFeedback({ type: 'success', message: 'Contraseña actualizada correctamente' })
    } catch (err) {
      setPasswordFeedback({ type: 'danger', message: err.message })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleCancelEditProfile = () => {
    setProfileForm({ nombre: profile.nombre, email: profile.email })
    setProfileFeedback(null)
    setEditingProfile(false)
  }

  const handleCancelEditPassword = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordFeedback(null)
    setEditingPassword(false)
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Cargando perfil...</p>
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
    <Container className="mt-4 profile-container">
      <h2 className="mb-4">Mi perfil</h2>

      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Información personal</span>
          {!editingProfile && (
            <Button variant="outline-light" size="sm" onClick={() => setEditingProfile(true)}>
              Editar perfil
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {profileFeedback && (
            <Alert variant={profileFeedback.type} dismissible onClose={() => setProfileFeedback(null)}>
              {profileFeedback.message}
            </Alert>
          )}

          {!editingProfile ? (
            <Row className="g-3">
              <Col md={6}>
                <p className="text-muted mb-1 small">ID</p>
                <p className="fw-bold">#{profile.id}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1 small">Rol</p>
                <Badge bg={getRoleVariant(profile.role)}>{profile.role}</Badge>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1 small">Nombre</p>
                <p className="fw-bold">{profile.nombre}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1 small">Email</p>
                <p className="fw-bold">{profile.email}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1 small">Miembro desde</p>
                <p className="fw-bold">{formatDate(profile.createdAt)}</p>
              </Col>
            </Row>
          ) : (
            <Form onSubmit={handleProfileSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={profileForm.nombre}
                  onChange={handleProfileFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Control type="text" value={profile.role} disabled readOnly />
                <Form.Text className="text-muted">El rol no puede modificarse desde aquí.</Form.Text>
              </Form.Group>
              <div className="d-flex gap-2">
                <Button variant="dark" type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button variant="outline-secondary" onClick={handleCancelEditProfile}>
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Cambiar contraseña</span>
          {!editingPassword && (
            <Button variant="outline-light" size="sm" onClick={() => setEditingPassword(true)}>
              Cambiar contraseña
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {passwordFeedback && (
            <Alert variant={passwordFeedback.type} dismissible onClose={() => setPasswordFeedback(null)}>
              {passwordFeedback.message}
            </Alert>
          )}

          {!editingPassword ? (
            <p className="text-muted mb-0">
              Por seguridad, tu contraseña no se muestra. Podés cambiarla cuando quieras.
            </p>
          ) : (
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña actual</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmar nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="••••••••"
                  required
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <Form.Text className="text-danger">Las contraseñas no coinciden.</Form.Text>
                )}
              </Form.Group>
              <div className="d-flex gap-2">
                <Button variant="dark" type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                </Button>
                <Button variant="outline-secondary" onClick={handleCancelEditPassword}>
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

    </Container>
  )
}

export default Profile