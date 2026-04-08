import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/GGH/i);
    await expect(page.locator('h1')).toContainText('GGH');
    await expect(page.locator('h1')).toContainText('Proposal AI');
  });

  test('should display hero section with CTA button', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await expect(page.getByText('OpenClaw Agentic Flow')).toBeVisible();
    await expect(page.getByText('Enterprise Quality')).toBeVisible();
    await expect(page.getByText('Rapid Iteration')).toBeVisible();
  });

  test('should open proposal generator dialog when CTA is clicked', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
    await ctaButton.click();
    
    await expect(page.getByText('AI Proposal Engine')).toBeVisible();
    await expect(page.getByText('Project Context')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
    await expect(ctaButton).toBeEnabled();
    
    // Check keyboard navigation
    await ctaButton.focus();
    await expect(ctaButton).toBeFocused();
  });
});
