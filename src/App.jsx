import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import Products from './components/Products'
import Login from './components/Login'
import Register from './components/Register'
import Cart from './components/Cart'

const App = () => {
  return (
    <BrowserRouter>

      {/* Global navigation bar */}
      <Navbar />

      {/* Page content changes based on the current route */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      {/* Global footer */}
      <Footer />

    </BrowserRouter>
  )
}

export default App