import { useContext, useState } from 'react'
import { Container, Table, Badge, Alert, Button, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

const Cart = () => {

  // Connect to CartContext
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useContext(CartContext)

  // Get the token from AuthContext to authenticate the order request
  const { token } = useContext(AuthContext)

  // Hook to navigate to other pages
  const navigate = useNavigate()

  // State to control the remove product modal
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  // State to store the product selected for removal
  const [productToRemove, setProductToRemove] = useState(null)

  // State to control the clear cart modal
  const [showClearModal, setShowClearModal] = useState(false)

  // State to control loading during checkout
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  // State to store checkout error message
  const [checkoutError, setCheckoutError] = useState(null)

  // Calculate total number of items across all products
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price across all products
  const totalPrice = cart.reduce((total, item) => total + item.precio * item.quantity, 0)

  // Opens the remove modal and saves which product to remove
  const handleRemoveClick = (item) => {
    setProductToRemove(item)
    setShowRemoveModal(true)
  }

  // Confirms the removal of the selected product
  const handleConfirmRemove = () => {
    removeFromCart(productToRemove.id)
    setProductToRemove(null)
    setShowRemoveModal(false)
  }

  // Cancels the removal and closes the modal
  const handleCancelRemove = () => {
    setProductToRemove(null)
    setShowRemoveModal(false)
  }

  // Opens the clear cart modal
  const handleClearClick = () => {
    setShowClearModal(true)
  }

  // Confirms clearing the entire cart
  const handleConfirmClear = () => {
    clearCart()
    setShowClearModal(false)
  }

  // Cancels clearing and closes the modal
  const handleCancelClear = () => {
    setShowClearModal(false)
  }

  // Handler for the decrease button
  // If quantity is 1, open the remove modal instead of decrementing
  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      handleRemoveClick(item)
    } else {
      decreaseQuantity(item.id)
    }
  }

  // Handler for the checkout button
  // Saves cart items before clearing, sends order to backend and navigates to summary
  const handleCheckout = async () => {
    console.log('Token:', token)
    setLoadingCheckout(true)
    setCheckoutError(null)

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send the JWT token in the Authorization header
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ total: totalPrice })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Save a copy of the cart before clearing it
      const purchasedItems = [...cart]

      // Clear the cart
      clearCart()

      // Navigate to order summary with the purchase details
      navigate('/order-summary', {
        state: {
          items: purchasedItems,
          total: totalPrice,
          orderId: data.id
        }
      })

    } catch (error) {
      setCheckoutError('Hubo un error al procesar la compra. Intentá de nuevo.')
    } finally {
      setLoadingCheckout(false)
    }
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Tu carrito</h2>

      {/* Checkout error message */}
      {checkoutError && (
        <Alert variant="danger">{checkoutError}</Alert>
      )}

      {/* Empty cart message */}
      {cart.length === 0 ? (
        <Alert variant="info">
          Tu carrito está vacío. ¡Agregá instrumentos desde la tienda!
        </Alert>
      ) : (
        <>
          {/* Products table */}
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
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>
                    <Badge bg="secondary">{item.categoria}</Badge>
                  </td>
                  <td>${item.precio.toLocaleString()}</td>
                  <td>
                    {/* Quantity controls */}
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => handleDecrease(item)}
                      >
                        −
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>${(item.precio * item.quantity).toLocaleString()}</td>
                  <td>
                    {/* Remove button opens the confirmation modal */}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveClick(item)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Cart summary and action buttons */}
          <div className="d-flex flex-column align-items-end gap-2">
            <p className="text-muted mb-0">
              Total de productos: <strong>{totalItems}</strong>
            </p>
            <h5>
              Total de compra: <strong>${totalPrice.toLocaleString()}</strong>
            </h5>

            <div className="d-flex gap-2 flex-wrap justify-content-end">

              {/* Navigate back to products */}
              <Button variant="outline-secondary" onClick={() => navigate('/products')}>
                Seguir comprando
              </Button>

              {/* Clear cart button opens the confirmation modal */}
              <Button variant="outline-danger" onClick={handleClearClick}>
                Vaciar carrito
              </Button>

              {/* Checkout button: disabled if not logged in or loading */}
              <Button
                variant="dark"
                onClick={handleCheckout}
                disabled={loadingCheckout || !token}
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

            {/* Message shown when user is not logged in */}
            {!token && (
              <p className="text-muted small mt-1">
                Debés <a href="/login">iniciar sesión</a> para finalizar la compra.
              </p>
            )}
          </div>
        </>
      )}

      {/* Modal: confirm remove single product */}
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
          <Button variant="secondary" onClick={handleCancelRemove}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmRemove}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: confirm clear entire cart */}
      <Modal show={showClearModal} onHide={handleCancelClear} centered>
        <Modal.Header closeButton>
          <Modal.Title>Vaciar carrito</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que querés vaciar el carrito? Se eliminarán todos los productos.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelClear}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmClear}>
            Vaciar
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default Cart