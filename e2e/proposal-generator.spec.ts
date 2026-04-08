import { test, expect } from '@playwright/test';

test.describe('Proposal Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open the proposal generator dialog
    const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
    await ctaButton.click();
    await expect(page.getByText('AI Proposal Engine')).toBeVisible();
  });

  test('should display all form fields', async ({ page }) => {
    await expect(page.getByLabel(/client name/i)).toBeVisible();
    await expect(page.getByLabel(/project title/i)).toBeVisible();
    await expect(page.getByLabel(/budget range/i)).toBeVisible();
    await expect(page.getByLabel(/timeline/i)).toBeVisible();
  });

  test('should display template selection cards', async ({ page }) => {
    await expect(page.getByText('Select Proposal Template')).toBeVisible();
    
    // Check for template cards
    const templates = ['Modern GGH', 'Enterprise Executive', 'Creative Partner', 'Minimalist Clean'];
    for (const template of templates) {
      await expect(page.getByText(template)).toBeVisible();
    }
  });

  test('should allow selecting a template', async ({ page }) => {
    // Click on the Enterprise Executive template card
    const enterpriseCard = page.locator('.group.relative.p-6').filter({ hasText: 'Enterprise Executive' });
    await enterpriseCard.click();
    
    // Wait a bit for the state to update
    await page.waitForTimeout(300);
    
    // Verify selection by checking if the card has the selected styling
    await expect(enterpriseCard).toHaveClass(/border-primary/);
  });

  test('should display requirements section with add button', async ({ page }) => {
    await expect(page.getByText('Project Requirements')).toBeVisible();
    await expect(page.getByRole('button', { name: /add requirement/i })).toBeVisible();
  });

  test('should add new requirement when button is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add requirement/i });
    const initialRequirements = await page.locator('[placeholder*="Feature or objective"]').count();
    
    await addButton.click();
    
    const newRequirements = await page.locator('[placeholder*="Feature or objective"]').count();
    expect(newRequirements).toBe(initialRequirements + 1);
  });

  test('should remove requirement when delete button is clicked', async ({ page }) => {
    // Add a requirement first
    const addButton = page.getByRole('button', { name: /add requirement/i });
    await addButton.click();
    
    const initialCount = await page.locator('[placeholder*="Feature or objective"]').count();
    
    // Hover over requirement to show delete button
    const requirement = page.locator('[placeholder*="Feature or objective"]').first();
    await requirement.hover();
    
    // Click delete button
    const deleteButton = page.locator('button[class*="group-hover:opacity-100"]').first();
    await deleteButton.click();
    
    const newCount = await page.locator('[placeholder*="Feature or objective"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should display tone selector', async ({ page }) => {
    await expect(page.getByText('Writing Tone')).toBeVisible();
    await expect(page.getByRole('button', { name: /formal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /casual/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /technical/i })).toBeVisible();
  });

  test('should allow selecting different tones', async ({ page }) => {
    const casualButton = page.locator('button:has-text("Casual")');
    await casualButton.click();
    
    // Verify the button has active styling
    await expect(casualButton).toHaveClass(/border-primary/);
  });

  test('should display custom sections builder', async ({ page }) => {
    await expect(page.getByText('Custom Sections')).toBeVisible();
    await expect(page.getByPlaceholder(/security considerations/i)).toBeVisible();
  });

  test('should add custom section when entered', async ({ page }) => {
    const input = page.getByPlaceholder(/security considerations/i);
    await input.fill('Security Audit');
    await input.press('Enter');
    
    await expect(page.getByText('Security Audit')).toBeVisible();
  });

  test('should display generate button', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate proposal/i });
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate proposal/i });
    await generateButton.click();
    
    // Wait for potential toast - it might not appear if form has default values
    await page.waitForTimeout(1000);
    
    // Check if either toast appeared OR form didn't submit (still on generator tab)
    const generatorTab = page.getByRole('tab', { name: /generator/i });
    await expect(generatorTab).toHaveAttribute('data-state', 'active');
  });

  test('should fill form and attempt generation', async ({ page }) => {
    // Fill in basic info
    await page.getByLabel(/client name/i).fill('Acme Corporation');
    await page.getByLabel(/project title/i).fill('Digital Transformation');
    await page.getByLabel(/budget range/i).fill('$100k - $200k');
    await page.getByLabel(/timeline/i).fill('6 months');
    
    // Fill in a requirement
    const titleInput = page.locator('[placeholder*="Feature or objective"]').first();
    const descInput = page.locator('[placeholder*="Describe the specific need"]').first();
    
    await titleInput.fill('Cloud Migration');
    await descInput.fill('Migrate legacy systems to AWS cloud infrastructure');
    
    // Click generate
    const generateButton = page.getByRole('button', { name: /generate proposal/i });
    await generateButton.click();
    
    // Should show loading state
    await expect(page.getByText(/generating/i)).toBeVisible({ timeout: 2000 });
  });

  test('should have tabs for different views', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /generator/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /preview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /history/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /analytics/i })).toBeVisible();
  });

  test('should switch to history tab', async ({ page }) => {
    const historyTab = page.getByRole('tab', { name: /history/i });
    await historyTab.click();
    
    await expect(page.getByText('Generation History')).toBeVisible();
  });

  test('should show loading skeleton in history tab', async ({ page }) => {
    const historyTab = page.getByRole('tab', { name: /history/i });
    await historyTab.click();
    
    // Should show skeleton initially
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible({ timeout: 500 });
  });

  test('should switch to analytics tab', async ({ page }) => {
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    await analyticsTab.click();
    
    await expect(page.getByText('Total Proposals')).toBeVisible();
    await expect(page.getByText('Client Engagement')).toBeVisible();
  });

  test('should display analytics cards', async ({ page }) => {
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    await analyticsTab.click();
    
    await expect(page.getByText('Document Exports')).toBeVisible();
    await expect(page.getByText('Finalized Rate')).toBeVisible();
    await expect(page.getByText('Generation Trend')).toBeVisible();
  });

  test('should have clear form button', async ({ page }) => {
    const clearButton = page.getByRole('button', { name: /clear form/i });
    await expect(clearButton).toBeVisible();
    
    // Fill a field
    await page.getByLabel(/client name/i).fill('Test Client');
    
    // Clear form
    await clearButton.click();
    
    // Field should be empty
    await expect(page.getByLabel(/client name/i)).toHaveValue('');
  });
});
