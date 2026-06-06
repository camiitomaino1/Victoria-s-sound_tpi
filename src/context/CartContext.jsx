import { createContext, useState } from 'react'

// 1. Create the context (the communication channel)
export const CartContext = createContext()

// 2. Create the Provider (the component that wraps the app and provides the data)
export const CartProvider = ({ children }) => {

  // 3. Global cart state: starts as an empty array
  const [cart, setCart] = useState([])

  // 4. Function to add a product to the cart
  const addToCart = (product) => {
    // Check if the product is already in the cart
    const alreadyInCart = cart.find((item) => item.id === product.id)

    if (alreadyInCart) {
      // If it exists, increase the quantity by 1
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // If it doesn't exist, add it with quantity 1
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  // 5. The value object contains everything the components can access
  const value = {
    cart,
    addToCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}