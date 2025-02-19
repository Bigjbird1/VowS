import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../cart';
import { mockProduct, mockCart } from '@/test/utils';
import { CartContextType } from '@/types/cart';

const TestComponent = () => {
  const { cart, addItem, removeItem, updateQuantity } = useCart() as CartContextType;
  
  return (
    <div>
      <div data-testid="cart-total">Total: ${cart.total}</div>
      <div data-testid="cart-items-count">{cart.items.length} items</div>
      <button
        onClick={() => addItem(mockProduct, 1)}
        data-testid="add-item"
      >
        Add Item
      </button>
      {cart.items.map((item) => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span>{item.product.title}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
            data-testid={`quantity-${item.id}`}
          />
          <button
            onClick={() => removeItem(item.id)}
            data-testid={`remove-${item.id}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

describe('CartContext', () => {
  const renderWithCart = () => {
    return render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
  };

  it('initializes with empty cart', () => {
    renderWithCart();
    
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $0');
    expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0 items');
  });

  it('adds item to cart', async () => {
    renderWithCart();
    
    fireEvent.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1 items');
      expect(screen.getByTestId(`cart-item-1`)).toBeInTheDocument();
      expect(screen.getByTestId('cart-total')).toHaveTextContent(`Total: $${mockProduct.price}`);
    });
  });

  it('updates item quantity', async () => {
    renderWithCart();
    
    // Add item first
    fireEvent.click(screen.getByTestId('add-item'));

    // Update quantity
    const quantityInput = await screen.findByTestId(`quantity-1`);
    fireEvent.change(quantityInput, { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByTestId('cart-total')).toHaveTextContent(`Total: $${mockProduct.price * 2}`);
    });
  });

  it('removes item from cart', async () => {
    renderWithCart();
    
    // Add item first
    fireEvent.click(screen.getByTestId('add-item'));

    // Remove item
    const removeButton = await screen.findByTestId(`remove-1`);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0 items');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $0');
    });
  });

  it('prevents invalid quantity updates', async () => {
    renderWithCart();
    
    // Add item first
    fireEvent.click(screen.getByTestId('add-item'));

    // Try to set invalid quantity
    const quantityInput = await screen.findByTestId(`quantity-1`);
    fireEvent.change(quantityInput, { target: { value: '-1' } });

    await waitFor(() => {
      expect(quantityInput).toHaveValue(1); // Should remain at 1
    });

    fireEvent.change(quantityInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0 items'); // Should remove item
    });
  });

  it('maintains cart state between renders', async () => {
    const { rerender } = renderWithCart();
    
    // Add item
    fireEvent.click(screen.getByTestId('add-item'));

    // Rerender component
    rerender(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1 items');
      expect(screen.getByTestId(`cart-item-1`)).toBeInTheDocument();
    });
  });
});
