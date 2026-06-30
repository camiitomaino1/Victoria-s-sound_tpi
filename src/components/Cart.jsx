import { useContext, useState } from 'react'
import { Container, Table, Badge, Alert, Button, Modal, Spinner, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

const STORE_ADDRESS = 'Corrientes 956, Rosario, Santa Fe'

const Cart = () => {

  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useContext(CartContext)
  const { token, fetchWithAuth } = useContext(AuthContext)
  const navigate = useNavigate()

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [productToRemove, setProductToRemove] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('domicilio')
  const [paymentMethod, setPaymentMethod] = useState('tarjeta')

  const [addressData, setAddressData] = useState({
    calle: '', numero: '', ciudad: '', provincia: '', codigoPostal: ''
  })
  const [addressTouched, setAddressTouched] = useState({})

  const [cardData, setCardData] = useState({
    numero: '', nombre: '', vencimiento: '', cvv: ''
  })
  const [cardTouched, setCardTouched] = useState({})

  const capitalizeWords = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Address validation rules
  const isCalleValid = (value) => value.trim().length >= 3
  const isNumeroValid = (value) => value.trim().length >= 1
  const isCiudadValid = (value) => value.trim().length >= 2
  const isProvinciaValid = (value) => value.trim().length >= 2
  const isCodigoPostalValid = (value) => value.trim().length >= 4

  const isAddressFormValid = () =>
    isCalleValid(addressData.calle) &&
    isNumeroValid(addressData.numero) &&
    isCiudadValid(addressData.ciudad) &&
    isProvinciaValid(addressData.provincia) &&
    isCodigoPostalValid(addressData.codigoPostal)

  // Card validation rules
  const isCardNumberValid = (value) => value.replace(/\s/g, '').length === 16
  const isCardNameValid = (value) => value.trim().length >= 3
  const isCardExpiryValid = (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value)
  const isCardCvvValid = (value) => /^\d{3,4}$/.test(value)

  const isCardFormValid = () =>
    isCardNumberValid(cardData.numero) &&
    isCardNameValid(cardData.nombre) &&
    isCardExpiryValid(cardData.vencimiento) &&
    isCardCvvValid(cardData.cvv)

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
  const handleConfirmClear = () => { clearCart(); setShowClearModal(false) }
  const handleCancelClear = () => setShowClearModal(false)

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      handleRemoveClick(item)
    } else {
      decreaseQuantity(item.id)
    }
  }

  const handleOpenCheckout = () => {
    setCheckoutError(null)
    setCardTouched({})
    setAddressTouched({})
    setShowCheckoutModal(true)
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    const shouldCapitalize = ['calle', 'ciudad', 'provincia'].includes(name)
    setAddressData({
      ...addressData,
      [name]: shouldCapitalize ? capitalizeWords(value) : value
    })
  }

  const handleAddressBlur = (field) => {
    setAddressTouched({ ...addressTouched, [field]: true })
  }

  const handleCardDataChange = (e) => {
    const { name, value } = e.target
    setCardData({
      ...cardData,
      [name]: name === 'nombre' ? capitalizeWords(value) : value
    })
  }

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
    setCardData({ ...cardData, numero: formatted })
  }

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 3) raw = `${raw.slice(0, 2)}/${raw.slice(2)}`
    setCardData({ ...cardData, vencimiento: raw })
  }

  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCardData({ ...cardData, cvv: raw })
  }

  const handleCardBlur = (field) => {
    setCardTouched({ ...cardTouched, [field]: true })
  }

  const handleCheckout = async () => {
    setLoadingCheckout(true)
    setCheckoutError(null)

    if (shippingMethod === 'domicilio') {
      setAddressTouched({ calle: true, numero: true, ciudad: true, provincia: true, codigoPostal: true })
      if (!isAddressFormValid()) {
        setCheckoutError('Completá la dirección de envío correctamente.')
        setLoadingCheckout(false)
        return
      }
    }

    if (paymentMethod === 'tarjeta') {
      setCardTouched({ numero: true, nombre: true, vencimiento: true, cvv: true })
      if (!isCardFormValid()) {
        setCheckoutError('Revisá los datos de la tarjeta marcados en rojo.')
        setLoadingCheckout(false)
        return
      }
    }

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
      setShowCheckoutModal(false)

      const fullAddress = shippingMethod === 'domicilio'
        ? `${addressData.calle} ${addressData.numero}, ${addressData.ciudad}, ${addressData.provincia} (CP ${addressData.codigoPostal})`
        : STORE_ADDRESS

      navigate('/order-summary', {
        state: {
          items: purchasedItems,
          total: totalPrice,
          orderId: data.id,
          shippingMethod,
          paymentMethod,
          shippingAddress: fullAddress
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
                <th></th>
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

                    {/* Product thumbnail */}
                    <td className="align-middle">
                      <img
                        src={item.imagen || 'https://placehold.co/60x60?text=?'}
                        alt={item.nombre}
                        className="cart-product-img"
                      />
                    </td>

                    <td className="align-middle">
                      {item.nombre}
                      {exceedsStock && (
                        <div className="text-danger small mt-1">
                          Stock disponible: {item.stock}
                        </div>
                      )}
                    </td>
                    <td className="align-middle">
                      <Badge bg="secondary">{item.categoria}</Badge>
                    </td>
                    <td className="align-middle">${item.precio.toLocaleString()}</td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center gap-2">
                        <Button variant="outline-dark" size="sm" onClick={() => handleDecrease(item)}>−</Button>
                        <span className={exceedsStock ? 'text-danger fw-bold' : ''}>{item.quantity}</span>
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
                    <td className="align-middle">${(item.precio * item.quantity).toLocaleString()}</td>
                    <td className="align-middle">
                      <Button variant="danger" size="sm" onClick={() => handleRemoveClick(item)}>
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
            <h5>Total de compra: <strong>${totalPrice.toLocaleString()}</strong></h5>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
              <Button variant="outline-secondary" onClick={() => navigate('/products')}>
                Seguir comprando
              </Button>
              <Button variant="outline-danger" onClick={handleClearClick}>
                Vaciar carrito
              </Button>
              <Button
                variant="dark"
                onClick={handleOpenCheckout}
                disabled={!token || hasStockIssues}
              >
                Finalizar compra
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

      {/* Checkout modal */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Finalizar compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {checkoutError && <Alert variant="danger">{checkoutError}</Alert>}

          <h6 className="checkout-section-title mb-3">Método de envío</h6>
          <Row className="mb-3 g-2">
            <Col md={6}>
              <div
                className={`shipping-option ${shippingMethod === 'domicilio' ? 'shipping-option-active' : ''}`}
                onClick={() => setShippingMethod('domicilio')}
              >
                <i className="bi bi-truck fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Envío a domicilio</p>
                  <p className="mb-0 small text-muted">Entrega en 3 a 5 días hábiles · Gratis</p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div
                className={`shipping-option ${shippingMethod === 'retiro' ? 'shipping-option-active' : ''}`}
                onClick={() => setShippingMethod('retiro')}
              >
                <i className="bi bi-shop fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Retiro en tienda</p>
                  <p className="mb-0 small text-muted">Disponible en 24 hs</p>
                </div>
              </div>
            </Col>
          </Row>

          {shippingMethod === 'domicilio' && (
            <div className="card-form-box mb-4">
              <p className="checkout-section-title mb-3" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-geo-alt me-1"></i> Dirección de envío
              </p>
              <Row>
                <Col xs={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Calle <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Ej: San Martín" name="calle"
                      value={addressData.calle} onChange={handleAddressChange}
                      onBlur={() => handleAddressBlur('calle')}
                      isInvalid={addressTouched.calle && !isCalleValid(addressData.calle)}
                      isValid={addressTouched.calle && isCalleValid(addressData.calle)}
                    />
                    <Form.Control.Feedback type="invalid">Ingresá el nombre de la calle.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Número <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Ej: 956" name="numero"
                      value={addressData.numero} onChange={handleAddressChange}
                      onBlur={() => handleAddressBlur('numero')}
                      isInvalid={addressTouched.numero && !isNumeroValid(addressData.numero)}
                      isValid={addressTouched.numero && isNumeroValid(addressData.numero)}
                    />
                    <Form.Control.Feedback type="invalid">Requerido.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Ciudad <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Ej: Rosario" name="ciudad"
                      value={addressData.ciudad} onChange={handleAddressChange}
                      onBlur={() => handleAddressBlur('ciudad')}
                      isInvalid={addressTouched.ciudad && !isCiudadValid(addressData.ciudad)}
                      isValid={addressTouched.ciudad && isCiudadValid(addressData.ciudad)}
                    />
                    <Form.Control.Feedback type="invalid">Ingresá la ciudad.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Provincia <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="Ej: Santa Fe" name="provincia"
                      value={addressData.provincia} onChange={handleAddressChange}
                      onBlur={() => handleAddressBlur('provincia')}
                      isInvalid={addressTouched.provincia && !isProvinciaValid(addressData.provincia)}
                      isValid={addressTouched.provincia && isProvinciaValid(addressData.provincia)}
                    />
                    <Form.Control.Feedback type="invalid">Ingresá la provincia.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-0">
                <Form.Label className="small">Código postal <span className="required-asterisk">*</span></Form.Label>
                <Form.Control
                  type="text" placeholder="Ej: 2000" name="codigoPostal"
                  value={addressData.codigoPostal} onChange={handleAddressChange}
                  onBlur={() => handleAddressBlur('codigoPostal')}
                  isInvalid={addressTouched.codigoPostal && !isCodigoPostalValid(addressData.codigoPostal)}
                  isValid={addressTouched.codigoPostal && isCodigoPostalValid(addressData.codigoPostal)}
                  style={{ maxWidth: '200px' }}
                />
                <Form.Control.Feedback type="invalid">Ingresá el código postal.</Form.Control.Feedback>
              </Form.Group>
            </div>
          )}

          {shippingMethod === 'retiro' && (
            <Alert variant="info" className="mb-4">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Podés retirar tu pedido en: <strong>{STORE_ADDRESS}</strong>
            </Alert>
          )}

          <h6 className="checkout-section-title mb-3">Método de pago</h6>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <div
                className={`payment-option ${paymentMethod === 'tarjeta' ? 'payment-option-active' : ''}`}
                onClick={() => setPaymentMethod('tarjeta')}
              >
                <i className="bi bi-credit-card fs-4"></i>
                <p className="mb-0 small fw-bold">Tarjeta</p>
              </div>
            </Col>
            <Col md={4}>
              <div
                className={`payment-option ${paymentMethod === 'efectivo' ? 'payment-option-active' : ''}`}
                onClick={() => setPaymentMethod('efectivo')}
              >
                <i className="bi bi-cash-stack fs-4"></i>
                <p className="mb-0 small fw-bold">Efectivo</p>
              </div>
            </Col>
            <Col md={4}>
              <div
                className={`payment-option ${paymentMethod === 'transferencia' ? 'payment-option-active' : ''}`}
                onClick={() => setPaymentMethod('transferencia')}
              >
                <i className="bi bi-bank fs-4"></i>
                <p className="mb-0 small fw-bold">Transferencia</p>
              </div>
            </Col>
          </Row>

          {paymentMethod === 'tarjeta' && (
            <div className="card-form-box mt-3">
              <div className="d-flex gap-2 mb-3 align-items-center">
                <i className="bi bi-credit-card-2-front fs-3" title="Visa"></i>
                <span className="card-brand-label">Visa</span>
                <i className="bi bi-credit-card-fill fs-3 ms-3" title="Mastercard"></i>
                <span className="card-brand-label">Mastercard</span>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="small">Número de tarjeta <span className="required-asterisk">*</span></Form.Label>
                <Form.Control
                  type="text" placeholder="0000 0000 0000 0000"
                  value={cardData.numero} onChange={handleCardNumberChange}
                  onBlur={() => handleCardBlur('numero')} maxLength={19}
                  isInvalid={cardTouched.numero && !isCardNumberValid(cardData.numero)}
                  isValid={cardTouched.numero && isCardNumberValid(cardData.numero)}
                />
                <Form.Control.Feedback type="invalid">El número debe tener 16 dígitos.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small">Nombre del titular <span className="required-asterisk">*</span></Form.Label>
                <Form.Control
                  type="text" placeholder="Como figura en la tarjeta"
                  name="nombre" value={cardData.nombre}
                  onChange={handleCardDataChange} onBlur={() => handleCardBlur('nombre')}
                  isInvalid={cardTouched.nombre && !isCardNameValid(cardData.nombre)}
                  isValid={cardTouched.nombre && isCardNameValid(cardData.nombre)}
                />
                <Form.Control.Feedback type="invalid">Ingresá el nombre completo del titular.</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Vencimiento <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="MM/AA"
                      value={cardData.vencimiento} onChange={handleExpiryChange}
                      onBlur={() => handleCardBlur('vencimiento')} maxLength={5}
                      isInvalid={cardTouched.vencimiento && !isCardExpiryValid(cardData.vencimiento)}
                      isValid={cardTouched.vencimiento && isCardExpiryValid(cardData.vencimiento)}
                    />
                    <Form.Control.Feedback type="invalid">Formato MM/AA, ej: 08/27.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">CVV <span className="required-asterisk">*</span></Form.Label>
                    <Form.Control
                      type="text" placeholder="123"
                      value={cardData.cvv} onChange={handleCvvChange}
                      onBlur={() => handleCardBlur('cvv')} maxLength={4}
                      isInvalid={cardTouched.cvv && !isCardCvvValid(cardData.cvv)}
                      isValid={cardTouched.cvv && isCardCvvValid(cardData.cvv)}
                    />
                    <Form.Control.Feedback type="invalid">3 o 4 dígitos.</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <p className="text-muted small mb-0">
                <i className="bi bi-shield-lock"></i> Datos de prueba, no se procesan pagos reales.
              </p>
            </div>
          )}

          {paymentMethod === 'efectivo' && (
            <Alert variant="info" className="mt-2">
              Pagás en efectivo al recibir tu pedido o al retirarlo en tienda.
            </Alert>
          )}

          {paymentMethod === 'transferencia' && (
            <Alert variant="info" className="mt-2">
              Recibirás los datos bancarios por email para realizar la transferencia.
            </Alert>
          )}

          <h5 className="mt-4 text-end">
            Total a pagar: <strong>${totalPrice.toLocaleString()}</strong>
          </h5>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={handleCheckout} disabled={loadingCheckout}>
            {loadingCheckout ? (
              <><Spinner animation="border" size="sm" className="me-2" />Procesando...</>
            ) : 'Confirmar compra'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove product modal */}
      <Modal show={showRemoveModal} onHide={handleCancelRemove} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToRemove && (
            <p>¿Estás seguro de que querés eliminar <strong>{productToRemove.nombre}</strong> del carrito?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelRemove}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmRemove}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Clear cart modal */}
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