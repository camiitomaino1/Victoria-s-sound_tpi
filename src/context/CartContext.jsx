import { createContext, useState } from 'react'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([])

  // Add a product to the cart with an optional quantity (default: 1)
  const addToCart = (product, quantity = 1) => {
    const alreadyInCart = cart.find((item) => item.id === product.id)

    if (alreadyInCart) {
      // If it exists, increase the quantity by the specified amount
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      // If it doesn't exist, add it with the specified quantity
      setCart([...cart, { ...product, quantity }])
    }
  }

  // Increase the quantity of a specific product by 1
  const increaseQuantity = (id) => {
    setCart(cart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  }

  // Decrease the quantity of a specific product by 1, minimum is 1
  const decreaseQuantity = (id) => {
    setCart(cart.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ))
  }

  // Remove a product from the cart by its id
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  // Clear all products from the cart
  const clearCart = () => {
    setCart([])
  }

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