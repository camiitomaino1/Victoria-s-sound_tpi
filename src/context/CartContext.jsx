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

  // Clear all products from the cart
  const clearCart = () => {
    setCart([])
  }

  // Increase the quantity of a specific product by 1
const increaseQuantity = (id) => {
  setCart(cart.map((item) =>
    item.id === id
      ? { ...item, quantity: item.quantity + 1 }
      : item
  ))
}

// Decrease the quantity of a specific product by 1
// Quantity never goes below 1 here; reaching 0 is handled in the UI with a removal confirmation
const decreaseQuantity = (id) => {
  setCart(cart.map((item) =>
    item.id === id && item.quantity > 1
      ? { ...item, quantity: item.quantity - 1 }
      : item
  ))
}

  // Values and functions available to all components
  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,   
    decreaseQuantity    
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}