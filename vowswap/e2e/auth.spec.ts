import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to sign up page and create account', async ({ page }) => {
    // Navigate to sign up page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/auth/signup');

    // Fill in sign up form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to home page after successful signup
    await expect(page).toHaveURL('/');
    
    // Should show user name in navbar
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should show validation errors on sign up form', async ({ page }) => {
    await page.goto('/auth/signup');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email address')).toBeVisible();

    // Test password mismatch
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in sign in form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to home page after successful signin
    await expect(page).toHaveURL('/');
    
    // Should show user menu in navbar
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in sign in form with invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should stay on signin page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should sign out successfully', async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Open user menu and click sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');

    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Should show sign in link
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
