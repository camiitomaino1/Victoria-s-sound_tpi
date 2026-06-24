import { useState, useEffect, useContext } from 'react'
import { Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const AdminProducts = () => {

  // Get the token to authenticate requests to protected endpoints
  const { token } = useContext(AuthContext)

  // State for the list of products
  const [products, setProducts] = useState([])

  // Loading state for the initial fetch
  const [loading, setLoading] = useState(true)

  // Error state for the initial fetch
  const [error, setError] = useState(null)

  // Controls whether the create/edit modal is visible
  const [showModal, setShowModal] = useState(false)

  // Stores the product being edited, or null when creating a new one
  const [editingProduct, setEditingProduct] = useState(null)

  // Form fields for the modal
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    categoria: '',
    precio: '',
    descripcion: ''
  })

  // Loading state while saving (create or update)
  const [saving, setSaving] = useState(false)

  // Feedback message after saving
  const [feedback, setFeedback] = useState(null)

  // Fetch all products when the component mounts
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch products from the public endpoint (no token required for GET)
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/products')
      if (!response.ok) throw new Error('Error al obtener los productos')
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Opens the modal in "create" mode
  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({ nombre: '', marca: '', categoria: '', precio: '', descripcion: '' })
    setShowModal(true)
  }

  // Opens the modal in "edit" mode, pre-filling the form with the product data
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      marca: product.marca,
      categoria: product.categoria,
      precio: product.precio,
      descripcion: product.descripcion
    })
    setShowModal(true)
  }

  // Updates a single form field as the user types
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Closes the modal and resets the editing state
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  // Handles form submission for both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    // If editingProduct exists, we are updating (PUT); otherwise, creating (POST)
    const isEditing = Boolean(editingProduct)
    const url = isEditing
      ? `http://localhost:3000/products/${editingProduct.id}`
      : 'http://localhost:3000/products'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Send the JWT token since these routes are protected
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Show success feedback and refresh the table
      setFeedback({ type: 'success', message: isEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente' })
      handleCloseModal()
      fetchProducts()

    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Show loading spinner while fetching products
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
      {/* Feedback message after create/edit */}
      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {/* New product button */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="dark" onClick={handleNewProduct}>
          <i className="bi bi-plus-lg"></i> Nuevo producto
        </Button>
      </div>

      {/* Products table */}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.nombre}</td>
              <td>{product.marca}</td>
              <td>{product.categoria}</td>
              <td>${product.precio.toLocaleString()}</td>
              <td>
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create / Edit modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </Modal.Title>
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
              <Form.Label>Marca</Form.Label>
              <Form.Control
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                name="categoria"
                value={formData.categoria}
                onChange={handleFormChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Guitarras">Guitarras</option>
                <option value="Bajos">Bajos</option>
                <option value="Teclados">Teclados</option>
                <option value="Baterías">Baterías</option>
                <option value="Violines">Violines</option>
                <option value="Accesorios">Accesorios</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="dark" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  )
}

export default AdminProducts