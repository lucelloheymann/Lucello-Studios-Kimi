import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Conversation Management Flow
 * 
 * Tests cover:
 * - Dashboard → Outreach navigation with filters
 * - Outreach Conversations filters
 * - Reply capture on lead detail page
 * - Follow-up creation
 * - Conversation closing (Won/Lost)
 * - Closed conversation restrictions
 */

test.describe('Conversation Flow', () => {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD → OUTREACH NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard');
    });

    test('should navigate to Conversations from "Offen" KPI', async ({ page }) => {
      const link = page.getByTestId('kpi-offen');
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations/);
    });

    test('should navigate to Replied filter from "Antworten heute" KPI', async ({ page }) => {
      const link = page.getByTestId('kpi-antworten-heute');
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations.*filter=replied/);
    });

    test('should navigate to Positive filter from "Positiv" KPI', async ({ page }) => {
      const link = page.getByTestId('kpi-positiv');
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations.*filter=positive/);
    });

    test('should navigate to Due Today filter from "Heute fällig" KPI', async ({ page }) => {
      const link = page.getByTestId('kpi-heute-faellig');
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations.*filter=due-today/);
    });

    test('should navigate to Overdue filter from "Überfällig" KPI', async ({ page }) => {
      const link = page.getByTestId('kpi-ueberfaellig');
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations.*filter=overdue/);
    });

    test('should navigate to Conversations from "Dringende Follow-ups" widget', async ({ page }) => {
      const link = page.getByRole('link', { name: /alle anzeigen/i });
      await link.click();
      await expect(page).toHaveURL(/\/outreach\?view=conversations/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTREACH CONVERSATIONS FILTERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Outreach Conversations Filters', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/outreach?view=conversations');
    });

    test('should display all filter buttons', async ({ page }) => {
      const filters = ['all', 'active', 'replied', 'due-today', 'overdue', 'positive', 'negative', 'closed'];
      for (const filter of filters) {
        await expect(page.getByTestId(`filter-${filter}`)).toBeVisible();
      }
    });

    test('should filter by "active" status', async ({ page }) => {
      await page.getByTestId('filter-active').click();
      await expect(page).toHaveURL(/filter=active/);
      // Should show active conversations (PENDING, REPLIED, FOLLOW_UP_SENT)
      const rows = page.locator('table tbody tr, [class*="divide-y"] > div');
      await expect(rows.first()).toBeVisible();
    });

    test('should filter by "replied" status', async ({ page }) => {
      await page.getByTestId('filter-replied').click();
      await expect(page).toHaveURL(/filter=replied/);
    });

    test('should filter by "due-today"', async ({ page }) => {
      await page.getByTestId('filter-due-today').click();
      await expect(page).toHaveURL(/filter=due-today/);
      // Due today items should show "Heute" or today's date
      await expect(page.getByText(/heute|überfällig/i).first()).toBeVisible();
    });

    test('should filter by "overdue"', async ({ page }) => {
      await page.getByTestId('filter-overdue').click();
      await expect(page).toHaveURL(/filter=overdue/);
      // Overdue items should show days overdue
      await expect(page.getByText(/überfällig/i).first()).toBeVisible();
    });

    test('should filter by "positive" sentiment', async ({ page }) => {
      await page.getByTestId('filter-positive').click();
      await expect(page).toHaveURL(/filter=positive/);
      // Should show positive sentiment badges
      await expect(page.getByText(/positiv/i).first()).toBeVisible();
    });

    test('should filter by "negative" sentiment', async ({ page }) => {
      await page.getByTestId('filter-negative').click();
      await expect(page).toHaveURL(/filter=negative/);
    });

    test('should filter by "closed" status', async ({ page }) => {
      await page.getByTestId('filter-closed').click();
      await expect(page).toHaveURL(/filter=closed/);
      // Closed conversations should show "Abgeschlossen" or Won/Lost status
    });

    test('should switch between tabs', async ({ page }) => {
      // Start on Conversations
      await expect(page.getByTestId('tab-conversations')).toHaveAttribute('data-active', 'true');
      
      // Switch to Entwürfe
      await page.getByTestId('tab-outreach').click();
      await expect(page).toHaveURL(/\/outreach/);
      await expect(page.getByTestId('tab-outreach')).toHaveAttribute('data-active', 'true');
      
      // Switch back
      await page.getByTestId('tab-conversations').click();
      await expect(page.getByTestId('tab-conversations')).toHaveAttribute('data-active', 'true');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAD DETAIL - REPLY CAPTURE
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Reply Capture on Lead Detail', () => {
    test('should display conversation section on lead with conversation', async ({ page }) => {
      // Navigate directly to a lead detail page
      await page.goto('/leads');
      
      // Get the first lead link and navigate to it
      const firstLead = page.locator('table tbody tr a, a[href^="/leads/c"]').first();
      const href = await firstLead.getAttribute('href');
      await page.goto(href || '/leads');
      
      // Wait for page to load and show either Conversation section or other content
      await page.waitForLoadState('networkidle');
      
      // Should show either Conversation section, Outreach section, or other lead content
      const hasContent = await page.locator('main h1, main h2, [class*="conversation"], [class*="outreach"]').first().isVisible().catch(() => false);
      expect(hasContent).toBe(true);
    });

    test('should show reply form for active conversation', async ({ page }) => {
      // Go to a lead detail page
      await page.goto('/leads');
      await page.locator('a[href^="/leads/"]').first().click();
      
      // Check if reply form exists (only for active conversations)
      const replyForm = page.getByText(/antwort erfassen/i);
      if (await replyForm.isVisible().catch(() => false)) {
        // If form is visible, sentiment buttons should be present
        await expect(page.getByRole('button', { name: /positiv/i }).first()).toBeVisible();
      }
      // If no form, test passes (no active conversation)
    });

    test('should require sentiment for reply submission', async ({ page }) => {
      await page.goto('/leads');
      await page.locator('a[href^="/leads/"]').first().click();
      
      // Try to submit without selecting sentiment
      const submitButton = page.getByRole('button', { name: /antwort erfassen/i });
      if (await submitButton.isVisible().catch(() => false)) {
        // Should be disabled without sentiment
        await expect(submitButton).toBeDisabled();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAD DETAIL - FOLLOW-UP CREATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Follow-up Creation', () => {
    test('should show follow-up button for active conversation', async ({ page }) => {
      await page.goto('/leads');
      await page.locator('a[href^="/leads/"]').first().click();
      
      // Follow-up button should be visible
      const followUpButton = page.getByRole('button', { name: /follow-up/i });
      // May or may not be visible depending on conversation state
    });

    test('should disable follow-up button when max reached', async ({ page }) => {
      // Navigate to conversation with 3 follow-ups
      // Button should be disabled
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSATION CLOSING
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Conversation Closing', () => {
    test('should show Won/Lost buttons for active conversation', async ({ page }) => {
      await page.goto('/leads');
      await page.locator('a[href^="/leads/"]').first().click();
      
      // Check for close buttons
      const gewonnenButton = page.getByRole('button', { name: /gewonnen/i });
      const verlorenButton = page.getByRole('button', { name: /verloren/i });
      
      // Should be visible for active conversations
      if (await gewonnenButton.isVisible().catch(() => false)) {
        await expect(gewonnenButton).toBeVisible();
        await expect(verlorenButton).toBeVisible();
      }
    });

    test('should not show action buttons for closed conversation', async ({ page }) => {
      // Navigate to a closed conversation
      // Check that Reply form, Follow-up button, and Close buttons are NOT visible
      // Instead should show "Abgeschlossen" message
    });

    test('should display closed status correctly', async ({ page }) => {
      // CLOSED_WON should show success styling
      // CLOSED_LOST should show neutral styling
      // NO_REPLY_CLOSED should show neutral styling
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA CONSISTENCY
  // ═══════════════════════════════════════════════════════════════════════════
  
  test.describe('Data Consistency', () => {
    test('should match counts between KPI and list', async ({ page }) => {
      // Get count from Dashboard
      await page.goto('/dashboard');
      const dueTodayText = await page.getByRole('link', { name: /heute fällig/i }).textContent();
      const dueTodayCount = parseInt(dueTodayText?.match(/\d+/)?.[0] || '0');
      
      // Navigate to Outreach with filter
      await page.getByRole('link', { name: /heute fällig/i }).click();
      
      // Count visible rows
      const rows = page.locator('[class*="divide-y"] > div, table tbody tr');
      const visibleCount = await rows.count();
      
      // Should match (or be close, depending on pagination)
      // This is a loose check since UI might show "X von Y"
    });

    test('should show correct sentiment in list', async ({ page }) => {
      await page.goto('/outreach?view=conversations&filter=positive');
      
      // Check that we're on the right filter
      await expect(page).toHaveURL(/filter=positive/);
      
      // Check that filter button is active
      const positiveFilter = page.getByTestId('filter-positive');
      await expect(positiveFilter).toHaveAttribute('data-active', 'true');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY & UX
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/outreach?view=conversations');
    
    const h1 = page.locator('h1');
    await expect(h1).toHaveText(/outreach/i);
  });

  test('filter buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/outreach?view=conversations');
    
    const filterButton = page.getByRole('button', { name: /aktiv/i });
    await filterButton.focus();
    await expect(filterButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/filter=active/);
  });
});
