import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./components/Home"
import Products from "./components/Products"
import ProductDetail from "./components/ProductDetail"
import Login from "./components/Login"
import Register from "./components/Register"
import Cart from "./components/Cart"
import Profile from "./components/Profile"
import OrderSummary from "./components/OrderSummary"
import AdminPanel from "./components/AdminPanel"
import SysAdminPanel from "./components/SysAdminPanel"
import OrdersHistory from "./components/OrdersHistory"
import OrderDetail from "./components/OrderDetail"
import Favorites from "./components/Favorites"
import PrivateRoute from "./components/PrivateRoute"
import AdminRoute from "./components/AdminRoute"
import SysAdminRoute from "./components/SysAdminRoute"
import NotFound from "./components/NotFound"

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes: require authentication */}
          <Route path="/cart" element={
            <PrivateRoute><Cart /></PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />

          <Route path="/order-summary" element={
            <PrivateRoute><OrderSummary /></PrivateRoute>
          } />

          <Route path="/mis-pedidos" element={
            <PrivateRoute><OrdersHistory /></PrivateRoute>
          } />

          <Route path="/orders/:id" element={
            <PrivateRoute><OrderDetail /></PrivateRoute>
          } />

          {/* Favorites: any authenticated user */}
          <Route path="/favorites" element={
            <PrivateRoute><Favorites /></PrivateRoute>
          } />

          {/* Admin panel: admin and sysadmin only */}
          <Route path="/admin" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />

          {/* Users management: sysadmin only */}
          <Route path="/admin/users" element={
            <SysAdminRoute><SysAdminPanel /></SysAdminRoute>
          } />

          {/* 404: catches any unmatched route, must be last */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App