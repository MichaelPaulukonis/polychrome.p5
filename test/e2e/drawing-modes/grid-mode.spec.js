// tests/e2e/drawing-modes/grid-mode.spec.js

import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  waitForFontsLoaded,
  setupConsoleErrorTracking,
  setDrawingMode,
  setPaintMode,
  setParameter,
  clearCanvas,
  canvasHasContent,
  drawTestPattern,
  getParameterValue
} from '../utils/canvas-utils.js'

test.describe.skip('Grid Drawing Mode', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    // Clear any existing content
    await clearCanvas(page)

    // Verify no critical errors occurred during setup
    expect(consoleErrors.filter(error =>
      !error.includes('404') &&
      !error.includes('favicon')
    )).toHaveLength(0)
  })

  test('grid mode renders text in grid pattern', async ({ page }) => {
    // Set grid drawing mode
    await setDrawingMode(page, 'Grid')

    // Verify mode was set
    const currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid')

    // Set basic grid parameters
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    // Set a solid color for predictable testing
    await setPaintMode(page, 'Black')

    // Draw test pattern
    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })

    // Wait for drawing to complete
    await page.waitForTimeout(200)

    // Verify canvas has content
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot for visual verification
    await expect(canvas).toHaveScreenshot('grid-mode-basic.png', {
      maxDiffPixelRatio: 0.1
    })
  })

  test('grid mode responds to parameter changes', async ({ page }) => {
    await setDrawingMode(page, 'Grid')

    // Test with small grid
    await setParameter(page, 'rows', 2)
    await setParameter(page, 'columns', 2)
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/grid-small.png' })

    // Clear and test with larger grid
    await clearCanvas(page)
    await setParameter(page, 'rows', 5)
    await setParameter(page, 'columns', 5)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Verify different output
    await expect(canvas).not.toHaveScreenshot('grid-small.png')
  })

  test('grid mode works with different paint modes', async ({ page }) => {
    await setDrawingMode(page, 'Grid')
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    const canvas = page.locator('canvas').first()

    // Test with rainbow mode
    await setPaintMode(page, 'Rainbow1')
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasRainbowContent = await canvasHasContent(page)
    expect(hasRainbowContent).toBe(true)

    // Clear and test with solid color
    await clearCanvas(page)
    await setPaintMode(page, 'solid')
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasSolidContent = await canvasHasContent(page)
    expect(hasSolidContent).toBe(true)
  })

  test('grid mode handles edge cases', async ({ page }) => {
    await setDrawingMode(page, 'Grid')

    // Test with minimal grid (1x1)
    await setParameter(page, 'rows', 1)
    await setParameter(page, 'columns', 1)
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Test with maximum reasonable grid
    await clearCanvas(page)
    await setParameter(page, 'rows', 10)
    await setParameter(page, 'columns', 10)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(500) // More time for complex grid

    const hasComplexContent = await canvasHasContent(page)
    expect(hasComplexContent).toBe(true)
  })
})
