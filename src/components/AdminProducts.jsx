import { useState, useEffect, useContext } from 'react'
import { Table, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap'
import { AuthContext } from '../context/AuthContext'

const AdminProducts = () => {

  const { fetchWithAuth } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    categoria: '',
    precio: '',
    descripcion: '',
    stock: 0
  })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showInactive, setShowInactive] = useState(false)

  const getStockVariant = (stock) => {
    if (stock === 0) return 'danger'
    if (stock <= 10) return 'warning'
    return 'success'
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth('http://localhost:3000/products/all')

      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
        return
      }

      const fallback = await fetch('http://localhost:3000/products')
      if (fallback.ok) {
        const data = await fallback.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        setError('Error al obtener los productos')
        setProducts([])
      }
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({ nombre: '', marca: '', categoria: '', precio: '', descripcion: '', stock: 0 })
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      marca: product.marca,
      categoria: product.categoria,
      precio: product.precio,
      descripcion: product.descripcion,
      stock: product.stock
    })
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const isEditing = Boolean(editingProduct)
    const url = isEditing
      ? `http://localhost:3000/products/${editingProduct.id}`
      : 'http://localhost:3000/products'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setFeedback({
        type: 'success',
        message: isEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
      })
      handleCloseModal()
      fetchProducts()
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    setFeedback(null)
    try {
      const response = await fetchWithAuth(`http://localhost:3000/products/${product.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, activo: false } : p
      ))

      setFeedback({ type: 'success', message: 'Producto desactivado correctamente' })
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    }
  }

  const handleRestore = async (product) => {
    setFeedback(null)
    try {
      const response = await fetchWithAuth(`http://localhost:3000/products/${product.id}/restore`, {
        method: 'PATCH'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, activo: true } : p
      ))

      setFeedback({ type: 'success', message: 'Producto reactivado correctamente' })
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message })
    }
  }

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

  const displayedProducts = showInactive
    ? products
    : products.filter((p) => p.activo)

  return (
    <div>
      {feedback && (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Check
          type="switch"
          label="Mostrar productos inactivos"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
        <Button variant="dark" onClick={handleNewProduct}>
          <i className="bi bi-plus-lg"></i> Nuevo producto
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {displayedProducts.map((product) => (
            <tr key={product.id} className={!product.activo ? 'table-secondary' : ''}>
              <td>{product.id}</td>
              <td>{product.nombre}</td>
              <td>{product.marca}</td>
              <td>{product.categoria}</td>
              <td>${product.precio.toLocaleString()}</td>
              <td>
                <Badge bg={getStockVariant(product.stock)}>
                  {product.stock === 0 ? 'Sin stock' : product.stock}
                </Badge>
              </td>
              <td>
                <Badge bg={product.activo ? 'success' : 'secondary'}>
                  {product.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  {product.activo ? (
                    <>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product)}
                      >
                        Desactivar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleRestore(product)}
                    >
                      Reactivar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
              <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Marca</Form.Label>
              <Form.Control type="text" name="marca" value={formData.marca} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select name="categoria" value={formData.categoria} onChange={handleFormChange} required>
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
              <Form.Control type="number" name="precio" value={formData.precio} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" name="stock" value={formData.stock} onChange={handleFormChange} min="0" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleFormChange} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
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