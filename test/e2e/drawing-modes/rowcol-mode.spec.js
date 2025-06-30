// tests/e2e/drawing-modes/rowcol-mode.spec.js

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

test.describe('RowCol Drawing Mode (Grid2)', () => {
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

  test('rowcol mode renders text in row-column pattern', async ({ page }) => {
    // Set rowcol drawing mode (Grid2)
    await setDrawingMode(page, 'Grid2')

    // Verify mode was set
    const currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid2')

    // Set basic parameters
    await setParameter(page, 'rows', 4)
    await setParameter(page, 'columns', 4)
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
    await expect(canvas).toHaveScreenshot('rowcol-mode-basic.png', {
      threshold: 0.2
    })
  })

  test('rowcol mode differs from grid mode', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // First test Grid mode
    await setDrawingMode(page, 'Grid')
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)
    await setPaintMode(page, 'Black')

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take Grid mode screenshot
    await canvas.screenshot({ path: 'test-results/grid-comparison.png' })

    // Clear and test Grid2 (RowCol) mode
    await clearCanvas(page)
    await setDrawingMode(page, 'Grid2')
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Verify Grid2 produces different output than Grid
    await expect(canvas).not.toHaveScreenshot('grid-comparison.png')
  })

  test('rowcol mode responds to parameter changes', async ({ page }) => {
    await setDrawingMode(page, 'Grid2')
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()

    // Test with different row/column combinations
    await setParameter(page, 'rows', 2)
    await setParameter(page, 'columns', 6)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/rowcol-2x6.png' })

    // Clear and test different ratio
    await clearCanvas(page)
    await setParameter(page, 'rows', 6)
    await setParameter(page, 'columns', 2)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Verify different output
    await expect(canvas).not.toHaveScreenshot('rowcol-2x6.png')
  })

  test('rowcol mode works with color variations', async ({ page }) => {
    await setDrawingMode(page, 'Grid2')
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    const canvas = page.locator('canvas').first()

    // Test with lerp color scheme
    await setPaintMode(page, 'lerp-scheme')
    await canvas.click({ position: { x: 150, y: 150 } })
    await page.waitForTimeout(200)

    const hasLerpContent = await canvasHasContent(page)
    expect(hasLerpContent).toBe(true)

    // Clear and test with rainbow
    await clearCanvas(page)
    await setPaintMode(page, 'Rainbow3')
    await canvas.click({ position: { x: 150, y: 150 } })
    await page.waitForTimeout(200)

    const hasRainbowContent = await canvasHasContent(page)
    expect(hasRainbowContent).toBe(true)
  })

  test('rowcol mode handles text flow', async ({ page }) => {
    await setDrawingMode(page, 'Grid2')
    await setParameter(page, 'rows', 5)
    await setParameter(page, 'columns', 5)
    await setPaintMode(page, 'Black')

    const canvas = page.locator('canvas').first()

    // Draw multiple times to test text flow through grid
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)
    await canvas.click({ position: { x: 150, y: 150 } })
    await page.waitForTimeout(100)
    await canvas.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(200)

    // Verify progressive content build
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot for verification
    await expect(canvas).toHaveScreenshot('rowcol-mode-flow.png', {
      threshold: 0.2
    })
  })
})
