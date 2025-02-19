import { createContext, useContext, useEffect, useState } from 'react'
import { Cart, CartContextType, CartItem } from '@/types/cart'
import { Product } from '@/types/product'

const CART_STORAGE_KEY = 'vowswap_cart'

const defaultCart: Cart = {
  items: [],
  total: 0
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart)
  const [initialized, setInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
      }
    }
    setInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, initialized])

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const addItem = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.product.id === product.id)
      
      let newItems: CartItem[]
      if (existingItem) {
        newItems = prevCart.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...prevCart.items, { id: crypto.randomUUID(), product, quantity }]
      }

      return {
        items: newItems,
        total: calculateTotal(newItems)
      }
    })
  }

  const removeItem = (productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.product.id !== productId)
      return {
        items: newItems,
        total: calculateTotal(newItems)
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
      return {
        items: newItems,
        total: calculateTotal(newItems)
      }
    })
  }

  const clearCart = () => {
    setCart(defaultCart)
  }

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0)

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
