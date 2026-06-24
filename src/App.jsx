import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import Products from './components/Products'
import Login from './components/Login'
import Register from './components/Register'
import Cart from './components/Cart'
import OrderSummary from './components/OrderSummary'
import AdminPanel from './components/AdminPanel'
import SysAdminPanel from './components/SysAdminPanel'
import OrdersHistory from './components/OrdersHistory'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import SysAdminRoute from './components/SysAdminRoute'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes: require authentication */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
          path="/order-summary"
          element={
            <PrivateRoute>
              <OrderSummary />
            </PrivateRoute>
          }
        />

        {/* Order history: any authenticated user */}
        <Route
          path="/mis-pedidos"
          element={
            <PrivateRoute>
              <OrdersHistory />
            </PrivateRoute>
          }
        />

        {/* Admin panel: admin and sysadmin only */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Users management: sysadmin only */}
        <Route
          path="/admin/users"
          element={
            <SysAdminRoute>
              <SysAdminPanel />
            </SysAdminRoute>
          }
        />

      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App