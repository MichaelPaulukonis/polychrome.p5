// tests/e2e/ui/parameter-controls.spec.js

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
  getParameterValue,
  clickGuiButton
} from '../utils/canvas-utils.js'

test.describe.skip('Parameter Controls', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    // Clear any existing content
    await clearCanvas(page)

    // Set up consistent testing environment
    await setDrawingMode(page, 'Grid')
    await setPaintMode(page, 'Black')

    // Verify no critical errors occurred during setup
    expect(consoleErrors.filter(error =>
      !error.includes('404') &&
      !error.includes('favicon')
    )).toHaveLength(0)
  })

  test('rows parameter affects grid layout', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Test with small number of rows
    await setParameter(page, 'rows', 2)
    await setParameter(page, 'columns', 3)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/rows-2.png' })

    // Clear and test with more rows
    await clearCanvas(page)
    await setParameter(page, 'rows', 5)
    await setParameter(page, 'columns', 3)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Should produce different layout
    await expect(canvas).not.toHaveScreenshot('rows-2.png')

    // Verify parameter was actually changed
    const currentRows = await getParameterValue(page, 'rows')
    expect(currentRows).toBe(5)
  })

  test('columns parameter affects grid layout', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Test with small number of columns
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 2)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/columns-2.png' })

    // Clear and test with more columns
    await clearCanvas(page)
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 6)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Should produce different layout
    await expect(canvas).not.toHaveScreenshot('columns-2.png')

    // Verify parameter was actually changed
    const currentColumns = await getParameterValue(page, 'columns')
    expect(currentColumns).toBe(6)
  })

  test('inset parameter affects text positioning', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    // Test with no inset
    await setParameter(page, 'inset', 0)
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/inset-0.png' })

    // Clear and test with larger inset
    await clearCanvas(page)
    await setParameter(page, 'inset', 20)

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Should produce different positioning
    await expect(canvas).not.toHaveScreenshot('inset-0.png')
  })

  test('hardEdge parameter affects text appearance', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    // Test with hardEdge off
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.hardEdge = false
      }
    })

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/hardedge-off.png' })

    // Clear and test with hardEdge on
    await clearCanvas(page)
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.hardEdge = true
      }
    })

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Should produce different appearance
    await expect(canvas).not.toHaveScreenshot('hardedge-off.png')
  })

  test('clear button clears canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw some content
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Verify canvas has content
    let hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Clear the canvas
    await clickGuiButton(page, 'clear')

    // Verify canvas is now empty
    hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(false)
  })

  test('frameRate parameter affects rendering speed', async ({ page }) => {
    // Set a low frame rate
    await setParameter(page, 'frameRate', 5)

    // Verify parameter was set
    const currentFrameRate = await getParameterValue(page, 'frameRate')
    expect(currentFrameRate).toBe(5)

    // This is more of a functional test - the visual difference would be
    // in animation speed, which is harder to test with screenshots
    // The test verifies the parameter can be set correctly
  })

  test('autoPaint parameter affects drawing behavior', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Test with autoPaint enabled
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.autoPaint = true
      }
    })

    // Move mouse over canvas (should trigger drawing if autoPaint is on)
    await canvas.hover({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(300)

    // Take screenshot
    await canvas.screenshot({ path: 'test-results/autopaint-on.png' })

    // Clear and test with autoPaint disabled
    await clearCanvas(page)
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.autoPaint = false
      }
    })

    // Move mouse over canvas (should not trigger drawing)
    await canvas.hover({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(300)

    // Should remain empty
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(false)
  })

  test('invert parameter affects color output', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    // Test with invert off
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.invert = false
      }
    })

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Take baseline screenshot
    await canvas.screenshot({ path: 'test-results/invert-off.png' })

    // Clear and test with invert on
    await clearCanvas(page)
    await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        app.__vue__.$data.pchrome.params.invert = true
      }
    })

    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Should produce inverted colors
    await expect(canvas).not.toHaveScreenshot('invert-off.png')
  })
})
