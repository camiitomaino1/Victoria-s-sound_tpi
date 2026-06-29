import { Container, Tabs, Tab } from 'react-bootstrap'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'

const AdminPanel = () => {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">
        <i className="bi bi-gear-fill"></i> Panel de Administración
      </h2>

      {/* Tabs to switch between Products and Orders sections */}
      <Tabs defaultActiveKey="products" id="admin-tabs" className="mb-4">

        <Tab eventKey="products" title="Productos">
          <AdminProducts />
        </Tab>

        <Tab eventKey="orders" title="Pedidos">
          <AdminOrders />
        </Tab>

      </Tabs>
    </Container>
  )
}

export default AdminPanel