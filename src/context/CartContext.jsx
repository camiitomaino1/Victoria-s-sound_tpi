import { createContext, useState } from 'react'

// Create the context
export const CartContext = createContext()

export const CartProvider = ({ children }) => {

  // Global cart state
  const [cart, setCart] = useState([])

  // Add a product to the cart or increase its quantity if it already exists
  const addToCart = (product) => {
    const alreadyInCart = cart.find((item) => item.id === product.id)

    if (alreadyInCart) {
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  // Remove a product from the cart by its id
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  // Values and functions available to all components
  const value = {
    cart,
    addToCart,
    removeFromCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}