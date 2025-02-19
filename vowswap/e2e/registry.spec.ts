import { test, expect } from '@playwright/test';

test.describe('Registry functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should create new registry', async ({ page }) => {
    // Navigate to registry creation
    await page.goto('/registry/new');
    
    // Fill registry details
    await page.fill('input[name="eventName"]', 'John & Jane Wedding');
    await page.fill('input[name="eventDate"]', '2025-12-31');
    await page.fill('input[name="partnerName"]', 'Jane Doe');
    await page.fill('input[name="partnerEmail"]', 'jane@example.com');
    await page.fill('textarea[name="description"]', 'Celebrating our special day');
    
    // Upload cover image
    await page.setInputFiles('input[type="file"]', 'public/placeholder.jpg');
    
    // Submit form
    await page.click('button[data-testid="create-registry"]');
    
    // Should redirect to registry page
    await expect(page.url()).toMatch(/\/registry\/[\w-]+/);
    
    // Verify registry details are displayed
    await expect(page.locator('text=John & Jane Wedding')).toBeVisible();
    await expect(page.locator('text=December 31, 2025')).toBeVisible();
  });

  test('should add and manage registry items', async ({ page }) => {
    // Go to existing registry
    await page.goto('/registry/1');
    
    // Add item from product
    await page.click('[data-testid="add-to-registry"]');
    
    // Set quantity and priority
    await page.fill('input[name="quantity"]', '2');
    await page.selectOption('select[name="priority"]', 'high');
    await page.fill('textarea[name="note"]', 'Perfect for our new home');
    
    // Save item
    await page.click('button[data-testid="save-registry-item"]');
    
    // Verify item was added
    await expect(page.locator('[data-testid="registry-item"]')).toBeVisible();
    await expect(page.locator('text=Perfect for our new home')).toBeVisible();
    
    // Edit item
    await page.click('[data-testid="edit-registry-item"]');
    await page.fill('input[name="quantity"]', '3');
    await page.click('button[data-testid="save-registry-item"]');
    
    // Verify changes
    await expect(page.locator('text=Quantity: 3')).toBeVisible();
    
    // Remove item
    await page.click('[data-testid="remove-registry-item"]');
    await page.click('button[data-testid="confirm-remove"]');
    
    // Verify item was removed
    await expect(page.locator('[data-testid="registry-item"]')).not.toBeVisible();
  });

  test('should handle registry contributions', async ({ page }) => {
    // Go to a shared registry link
    await page.goto('/registry/1/share');
    
    // Select an item to contribute to
    await page.click('[data-testid="contribute-button"]');
    
    // Set contribution amount
    await page.fill('input[name="contributionAmount"]', '50');
    
    // Add message
    await page.fill('textarea[name="message"]', 'Congratulations!');
    
    // Fill payment details
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');
    
    // Submit contribution
    await page.click('button[data-testid="submit-contribution"]');
    
    // Verify success message
    await expect(page.locator('text=Thank you for your contribution')).toBeVisible();
    
    // Verify contribution is reflected in progress
    await expect(page.locator('[data-testid="contribution-progress"]')).toContainText('$50');
  });

  test('should manage registry settings', async ({ page }) => {
    await page.goto('/registry/1/settings');
    
    // Update privacy settings
    await page.click('text=Private');
    
    // Update shipping address
    await page.fill('input[name="shippingAddress.address1"]', '456 Wedding Ave');
    await page.fill('input[name="shippingAddress.city"]', 'Love City');
    await page.fill('input[name="shippingAddress.state"]', 'CA');
    await page.fill('input[name="shippingAddress.postalCode"]', '54321');
    
    // Save settings
    await page.click('button[data-testid="save-settings"]');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes are reflected
    await page.reload();
    await expect(page.locator('input[name="shippingAddress.address1"]')).toHaveValue('456 Wedding Ave');
  });

  test('should handle registry sharing', async ({ page }) => {
    await page.goto('/registry/1');
    
    // Open share dialog
    await page.click('[data-testid="share-registry"]');
    
    // Copy share link
    await page.click('[data-testid="copy-link"]');
    
    // Verify copy confirmation
    await expect(page.locator('text=Link copied to clipboard')).toBeVisible();
    
    // Share via email
    await page.fill('input[name="email"]', 'friend@example.com');
    await page.click('button[data-testid="send-email"]');
    
    // Verify email sent confirmation
    await expect(page.locator('text=Registry shared successfully')).toBeVisible();
  });
});
