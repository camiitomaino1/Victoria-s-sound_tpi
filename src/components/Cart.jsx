import { useContext, useState } from 'react'
import { Container, Table, Badge, Alert, Button, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

const Cart = () => {

  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useContext(CartContext)
  const { token, fetchWithAuth } = useContext(AuthContext)
  const navigate = useNavigate()

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [productToRemove, setProductToRemove] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => total + item.precio * item.quantity, 0)

  const hasStockIssues = cart.some(
    (item) => item.stock !== undefined && item.quantity > item.stock
  )

  const handleRemoveClick = (item) => {
    setProductToRemove(item)
    setShowRemoveModal(true)
  }

  const handleConfirmRemove = () => {
    removeFromCart(productToRemove.id)
    setProductToRemove(null)
    setShowRemoveModal(false)
  }

  const handleCancelRemove = () => {
    setProductToRemove(null)
    setShowRemoveModal(false)
  }

  const handleClearClick = () => setShowClearModal(true)

  const handleConfirmClear = () => {
    clearCart()
    setShowClearModal(false)
  }

  const handleCancelClear = () => setShowClearModal(false)

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      handleRemoveClick(item)
    } else {
      decreaseQuantity(item.id)
    }
  }

  const handleCheckout = async () => {
    setLoadingCheckout(true)
    setCheckoutError(null)

    try {
      const response = await fetchWithAuth('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: totalPrice,
          items: cart.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            quantity: item.quantity
          }))
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      const purchasedItems = [...cart]
      clearCart()

      navigate('/order-summary', {
        state: {
          items: purchasedItems,
          total: totalPrice,
          orderId: data.id
        }
      })

    } catch (error) {
      setCheckoutError(error.message)
    } finally {
      setLoadingCheckout(false)
    }
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Tu carrito</h2>

      {checkoutError && (
        <Alert variant="danger">{checkoutError}</Alert>
      )}

      {hasStockIssues && (
        <Alert variant="warning">
          Algunos productos en tu carrito superan el stock disponible. Ajustá las cantidades antes de continuar.
        </Alert>
      )}

      {cart.length === 0 ? (
        <Alert variant="info">
          Tu carrito está vacío. ¡Agregá instrumentos desde la tienda!
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const exceedsStock = item.stock !== undefined && item.quantity > item.stock
                return (
                  <tr key={item.id} className={exceedsStock ? 'table-warning' : ''}>
                    <td>
                      {item.nombre}
                      {exceedsStock && (
                        <div className="text-danger small mt-1">
                          Stock disponible: {item.stock}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg="secondary">{item.categoria}</Badge>
                    </td>
                    <td>${item.precio.toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => handleDecrease(item)}
                        >
                          −
                        </Button>
                        <span className={exceedsStock ? 'text-danger fw-bold' : ''}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => increaseQuantity(item.id)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>${(item.precio * item.quantity).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveClick(item)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          <div className="d-flex flex-column align-items-end gap-2">
            <p className="text-muted mb-0">
              Total de productos: <strong>{totalItems}</strong>
            </p>
            <h5>
              Total de compra: <strong>${totalPrice.toLocaleString()}</strong>
            </h5>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
              <Button variant="outline-secondary" onClick={() => navigate('/products')}>
                Seguir comprando
              </Button>
              <Button variant="outline-danger" onClick={handleClearClick}>
                Vaciar carrito
              </Button>
              <Button
                variant="dark"
                onClick={handleCheckout}
                disabled={loadingCheckout || !token || hasStockIssues}
              >
                {loadingCheckout ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Finalizar compra'
                )}
              </Button>
            </div>
            {!token && (
              <p className="text-muted small mt-1">
                Debés <a href="/login">iniciar sesión</a> para finalizar la compra.
              </p>
            )}
          </div>
        </>
      )}

      <Modal show={showRemoveModal} onHide={handleCancelRemove} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToRemove && (
            <p>
              ¿Estás seguro de que querés eliminar{' '}
              <strong>{productToRemove.nombre}</strong> del carrito?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelRemove}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmRemove}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClearModal} onHide={handleCancelClear} centered>
        <Modal.Header closeButton>
          <Modal.Title>Vaciar carrito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que querés vaciar el carrito? Se eliminarán todos los productos.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelClear}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmClear}>Vaciar</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default Cart