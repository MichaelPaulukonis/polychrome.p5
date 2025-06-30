// tests/e2e/drawing-modes/circle-mode.spec.js

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
  getParameterValue
} from '../utils/canvas-utils.js'

test.describe('Circle Drawing Mode', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
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

  test('circle mode renders text in circular pattern', async ({ page }) => {
    // Set circle drawing mode
    await setDrawingMode(page, 'Circle')

    // Verify mode was set
    const currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Circle')

    // Set predictable parameters for testing
    await setPaintMode(page, 'Black')
    await setParameter(page, 'circleRadius', 100)

    // Draw test pattern
    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 200, y: 200 } })

    // Wait for drawing to complete
    await page.waitForTimeout(200)

    // Verify canvas has content
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot for visual verification
    await expect(canvas).toHaveScreenshot('circle-mode-basic.png', {
      threshold: 0.2
    })
  })

  test('circle mode responds to radius changes', async ({ page }) => {
    await setDrawingMode(page, 'Circle')
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()

    // Test with small radius
    await setParameter(page, 'circleRadius', 50)
    await canvas.click({ position: { x: 150, y: 150 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/circle-small.png' })

    // Clear and test with larger radius
    await clearCanvas(page)
    await setParameter(page, 'circleRadius', 150)

    await canvas.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(200)

    // Verify different output
    await expect(canvas).not.toHaveScreenshot('circle-small.png')
  })

  test('circle mode works with different paint modes', async ({ page }) => {
    await setDrawingMode(page, 'Circle')
    await setParameter(page, 'circleRadius', 100)

    const canvas = page.locator('canvas').first()

    // Test with rainbow mode
    await setPaintMode(page, 'Rainbow1')
    await canvas.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(200)

    const hasRainbowContent = await canvasHasContent(page)
    expect(hasRainbowContent).toBe(true)

    // Clear and test with different rainbow mode
    await clearCanvas(page)
    await setPaintMode(page, 'Rainbow2')
    await canvas.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(200)

    const hasDifferentRainbowContent = await canvasHasContent(page)
    expect(hasDifferentRainbowContent).toBe(true)
  })

  test('circle mode handles multiple circles', async ({ page }) => {
    await setDrawingMode(page, 'Circle')
    await setPaintMode(page, 'Black')
    await setParameter(page, 'circleRadius', 75)

    const canvas = page.locator('canvas').first()

    // Draw multiple circles
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)
    await canvas.click({ position: { x: 200, y: 100 } })
    await page.waitForTimeout(100)
    await canvas.click({ position: { x: 150, y: 200 } })
    await page.waitForTimeout(200)

    // Verify content was created
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot to verify multiple circles
    await expect(canvas).toHaveScreenshot('circle-mode-multiple.png', {
      threshold: 0.2
    })
  })

  test('circle mode edge cases', async ({ page }) => {
    await setDrawingMode(page, 'Circle')
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()

    // Test with very small radius
    await setParameter(page, 'circleRadius', 10)
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    let hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Test with large radius
    await clearCanvas(page)
    await setParameter(page, 'circleRadius', 300)
    await canvas.click({ position: { x: 400, y: 400 } })
    await page.waitForTimeout(300) // More time for complex drawing

    hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)
  })
})
