import { test, expect } from '@playwright/test';

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should complete checkout process', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/products/1');
    
    // Add to cart
    await page.click('button[data-testid="add-to-cart"]');
    
    // Open cart
    await page.click('[data-testid="cart-icon"]');
    
    // Verify product is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // Go to checkout
    await page.click('button[data-testid="checkout-button"]');
    await expect(page).toHaveURL('/checkout');

    // Fill shipping info
    await page.fill('input[name="shippingAddress.firstName"]', 'Test');
    await page.fill('input[name="shippingAddress.lastName"]', 'User');
    await page.fill('input[name="shippingAddress.address1"]', '123 Test St');
    await page.fill('input[name="shippingAddress.city"]', 'Test City');
    await page.fill('input[name="shippingAddress.state"]', 'CA');
    await page.fill('input[name="shippingAddress.postalCode"]', '12345');
    await page.fill('input[name="shippingAddress.phone"]', '1234567890');
    
    // Continue to payment
    await page.click('button[data-testid="continue-to-payment"]');
    
    // Fill payment info (using test card)
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');
    
    // Review order
    await page.click('button[data-testid="review-order"]');
    
    // Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    
    // Place order
    await page.click('button[data-testid="place-order"]');
    
    // Should redirect to order confirmation
    await expect(page.url()).toMatch(/\/orders\/[\w-]+/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
    
    // Verify order details are displayed
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
  });

  test('should show validation errors in checkout forms', async ({ page }) => {
    await page.goto('/checkout');

    // Try to continue without filling shipping info
    await page.click('button[data-testid="continue-to-payment"]');
    
    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=State is required')).toBeVisible();
    await expect(page.locator('text=Postal code is required')).toBeVisible();
    await expect(page.locator('text=Phone is required')).toBeVisible();

    // Fill shipping info with invalid data
    await page.fill('input[name="shippingAddress.postalCode"]', 'invalid');
    await page.fill('input[name="shippingAddress.phone"]', 'invalid');
    
    // Try to continue
    await page.click('button[data-testid="continue-to-payment"]');
    
    // Should show format validation errors
    await expect(page.locator('text=Invalid postal code')).toBeVisible();
    await expect(page.locator('text=Invalid phone number')).toBeVisible();
  });

  test('should handle payment errors', async ({ page }) => {
    await page.goto('/checkout');

    // Fill shipping info
    await page.fill('input[name="shippingAddress.firstName"]', 'Test');
    await page.fill('input[name="shippingAddress.lastName"]', 'User');
    await page.fill('input[name="shippingAddress.address1"]', '123 Test St');
    await page.fill('input[name="shippingAddress.city"]', 'Test City');
    await page.fill('input[name="shippingAddress.state"]', 'CA');
    await page.fill('input[name="shippingAddress.postalCode"]', '12345');
    await page.fill('input[name="shippingAddress.phone"]', '1234567890');
    
    // Continue to payment
    await page.click('button[data-testid="continue-to-payment"]');
    
    // Use declined test card
    await page.fill('input[name="cardNumber"]', '4000000000000002');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');
    
    // Try to place order
    await page.click('button[data-testid="place-order"]');
    
    // Should show payment error
    await expect(page.locator('text=Your card was declined')).toBeVisible();
  });

  test('should update cart during checkout', async ({ page }) => {
    await page.goto('/checkout');

    // Update quantity
    await page.fill('[data-testid="quantity-input"]', '2');
    
    // Should update total
    await expect(page.locator('[data-testid="order-total"]')).toContainText('$199.98');
    
    // Remove item
    await page.click('[data-testid="remove-item"]');
    
    // Should redirect back to cart when all items removed
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });
});
