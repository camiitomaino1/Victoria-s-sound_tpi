import { useState, useEffect, useContext } from 'react'
import { Container, Card, Row, Col, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const Profile = () => {

  // Get token and user from AuthContext
  const { token, user: authUser, login } = useContext(AuthContext)

  // State for the full profile data from the API
  const [profile, setProfile] = useState(null)

  // Loading state while fetching profile
  const [loading, setLoading] = useState(true)

  // Error state if the fetch fails
  const [error, setError] = useState(null)

  // Controls whether the edit profile form is visible
  const [editingProfile, setEditingProfile] = useState(false)

  // Controls whether the change password form is visible
  const [editingPassword, setEditingPassword] = useState(false)

  // Form data for editing profile
  const [profileForm, setProfileForm] = useState({ nombre: '', email: '' })

  // Form data for changing password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Feedback messages for each section
  const [profileFeedback, setProfileFeedback] = useState(null)
  const [passwordFeedback, setPasswordFeedback] = useState(null)

  // Loading state while saving
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Returns Bootstrap badge color based on role
  const getRoleVariant = (role) => {
    const variants = { user: 'secondary', admin: 'primary', sysadmin: 'danger' }
    return variants[role] || 'secondary'
  }

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Fetch the user's own profile when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

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

  // Handler for profile form field changes
  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  // Handler for password form field changes
  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  // Submit handler for profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileFeedback(null)

    try {
      const response = await fetch('http://localhost:3000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Update local profile state with the new data
      setProfile(data)
      setEditingProfile(false)
      setProfileFeedback({ type: 'success', message: 'Perfil actualizado correctamente' })
    } catch (err) {
      setProfileFeedback({ type: 'danger', message: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  // Submit handler for password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback(null)

    // Validate that new password and confirmation match before sending
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'danger', message: 'Las contraseñas nuevas no coinciden' })
      return
    }

    // Validate minimum password length
    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'danger', message: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    setSavingPassword(true)

    try {
      const response = await fetch('http://localhost:3000/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Reset form and show success message
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setEditingPassword(false)
      setPasswordFeedback({ type: 'success', message: 'Contraseña actualizada correctamente' })
    } catch (err) {
      setPasswordFeedback({ type: 'danger', message: err.message })
    } finally {
      setSavingPassword(false)
    }
  }

  // Cancel editing profile and reset form to current values
  const handleCancelEditProfile = () => {
    setProfileForm({ nombre: profile.nombre, email: profile.email })
    setProfileFeedback(null)
    setEditingProfile(false)
  }

  // Cancel editing password and reset form
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
    <Container className="mt-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4">Mi perfil</h2>

      {/* Profile info card */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <span>Información personal</span>
          {!editingProfile && (
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setEditingProfile(true)}
            >
              Editar perfil
            </Button>
          )}
        </Card.Header>
        <Card.Body>

          {/* Profile feedback message */}
          {profileFeedback && (
            <Alert
              variant={profileFeedback.type}
              dismissible
              onClose={() => setProfileFeedback(null)}
            >
              {profileFeedback.message}
            </Alert>
          )}

          {/* Read mode: show profile data */}
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
            // Edit mode: show editable form
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

              {/* Role and ID are read-only and cannot be modified by the user */}
              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Control
                  type="text"
                  value={profile.role}
                  disabled
                  readOnly
                />
                <Form.Text className="text-muted">
                  El rol no puede modificarse desde aquí.
                </Form.Text>
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

      {/* Change password card */}
      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <span>Cambiar contraseña</span>
          {!editingPassword && (
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setEditingPassword(true)}
            >
              Cambiar contraseña
            </Button>
          )}
        </Card.Header>
        <Card.Body>

          {/* Password feedback message */}
          {passwordFeedback && (
            <Alert
              variant={passwordFeedback.type}
              dismissible
              onClose={() => setPasswordFeedback(null)}
            >
              {passwordFeedback.message}
            </Alert>
          )}

          {/* Password change form: only visible when editing */}
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
                {/* Live feedback if passwords don't match */}
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <Form.Text className="text-danger">
                    Las contraseñas no coinciden.
                  </Form.Text>
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