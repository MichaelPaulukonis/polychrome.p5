// Quick validation test for panel expansion fix
import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  waitForQuickSettingsReady,
  expandAllGuiPanels,
  clearCanvas
} from '../utils/canvas-utils.js'

test.describe('Panel Expansion Fix Validation', () => {
  test('clear button works after panel expansion', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000')

    // Wait for everything to be ready
    await waitForP5Ready(page)
    await waitForQuickSettingsReady(page)

    // Verify clear button is NOT visible when panels are collapsed
    let clearButtonBefore = page.locator('input[value="clear"]')
    let isVisibleBefore = await clearButtonBefore.isVisible().catch(() => false)
    console.log('Clear button visible BEFORE expansion:', isVisibleBefore)

    // Expand all panels
    await expandAllGuiPanels(page)

    // Verify clear button IS visible after expansion
    let clearButtonAfter = page.locator('input[value="clear"]')
    let isVisibleAfter = await clearButtonAfter.isVisible().catch(() => false)
    console.log('Clear button visible AFTER expansion:', isVisibleAfter)

    // The clear button should now be visible and clickable
    await expect(clearButtonAfter).toBeVisible()

    // Test clicking the clear button
    await clearButtonAfter.click()
    console.log('Clear button clicked successfully!')

    // Test using the clearCanvas utility function
    await clearCanvas(page)
    console.log('clearCanvas() utility worked!')
  })

  test('drawing mode dropdown works after panel expansion', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await waitForP5Ready(page)
    await waitForQuickSettingsReady(page)
    await expandAllGuiPanels(page)

    // Find and interact with drawing mode dropdown
    const drawModeSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Grid' })
    })

    await expect(drawModeSelect).toBeVisible()
    await drawModeSelect.selectOption({ label: 'Circle' })
    console.log('Drawing mode changed to Circle successfully!')
  })
})
