import { useContext } from 'react'
import { Container, Table, Badge, Alert, Button } from 'react-bootstrap'
import { CartContext } from '../context/CartContext'

const Cart = () => {

  // Connect to CartContext to read cart and use removeFromCart
  const { cart, removeFromCart } = useContext(CartContext)

  // Calculate total number of items across all products
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // Handler for the remove button
  const handleRemove = (id) => {
    removeFromCart(id)
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Tu carrito</h2>

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
                  <td>{item.quantity}</td>
                  <td>${(item.precio * item.quantity).toLocaleString()}</td>
                  <td>
                    {/* Remove button: passes the item id to handleRemove */}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Cart summary */}
          <p className="text-muted">
            Total de productos: <strong>{totalItems}</strong>
          </p>
        </>
      )}
    </Container>
  )
}

export default Cart