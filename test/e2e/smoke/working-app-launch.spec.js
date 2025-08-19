// tests/e2e/smoke/working-app-launch.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, setupConsoleErrorTracking } from '../utils/canvas-utils.js'

test.describe('Working Application Launch', () => {
  test('application loads with p5.js successfully', async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await waitForP5Ready(page)

    const isCanvasVisible = await page.locator('canvas').first().isVisible()
    expect(isCanvasVisible).toBe(true)
    expect(consoleErrors).toHaveLength(0)
  })

  test('canvas is interactive and ready for drawing', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // A simple click interaction to ensure it's responsive
    await canvas.click({ position: { x: 10, y: 10 } })
  })
})