// tests/e2e/smoke/app-launch.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, setupConsoleErrorTracking } from '../utils/canvas-utils.js'

test.describe('Application Launch', () => {
  test('application loads successfully without errors', async ({ page }) => {
    // Setup console error tracking before navigation
    const consoleErrors = setupConsoleErrorTracking(page)

    // Navigate to the application
    await page.goto('/')

    // Wait for p5.js to initialize completely
    await waitForP5Ready(page)

    // Verify canvas is visible
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Verify no critical errors occurred during load
    expect(consoleErrors).toHaveLength(0)
  })

  test('p5.js instance has required properties', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    // Check that p5.js instance has the expected properties for PolychromeText
    const p5Properties = await page.evaluate(() => {
      const canvas = document.querySelector('canvas#defaultCanvas0')
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas?.width || 0,
        canvasHeight: canvas?.height || 0
      }
    })

    expect(p5Properties.hasCanvas).toBe(true)
    expect(p5Properties.canvasWidth).toBeGreaterThan(0)
    expect(p5Properties.canvasHeight).toBeGreaterThan(0)
  })
})