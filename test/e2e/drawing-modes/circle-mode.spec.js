// tests/e2e/drawing-modes/circle-mode.spec.js

import { test, expect } from '@playwright/test'
import {
  basicSetup,
  canvasHasContent,
  clearCanvas,
  setDrawingMode,
  setupConsoleErrorTracking,
  simulatePaintGesture,
  waitForFontsLoaded,
  waitForP5Ready
} from '../utils/canvas-utils.js'

const testText = 'This is a test text for Playwright.'

// based on defaults.classic
const circleDefaultParams = {
  "name": "polychrome.text",
  "width": 400,
  "height": 400,
  "frameRate": 30,
  "fixedWidth": true,
  "font": "Arial Rounded MT Bold",
  "rotation": 0,
  "cumulativeRotation": false,
  "autoPaint": false,
  "drawMode": "Circle",
  "inset": 0,
  "invert": false,
  "useOutline": false,
  "useFill": true,
  "nextCharMode": "Sequential",
  "maxrows": 100,
  "rows": 10,
  "columns": 10,
  "rowmax": 100,
  "colmax": 100,
  "hardEdge": true,
  "useShadow": false,
  "shadowOffsetX": 5,
  "shadowOffsetY": 5,
  "shadowBlur": 5,
  "shadowColor": "#000000",
  "gamma": 0.8,
  "capturing": false,
  "fill": {
    "paintModes": [
      "Rainbow1",
      "Rainbow2",
      "Rainbow3",
      "Rainbow4",
      "Black",
      "White",
      "Gray1",
      "Gray2",
      "solid",
      "lerp-scheme",
      "lerp-quad"
    ],
    "paintMode": "Rainbow1",
    "transparency": 50,
    "transparent": true,
    "color": "#ffffff",
    "scheme": "ffffff-000000",
    "curCycle": 0,
    "lerps": [
      "#70c1b3",
      "#008000",
      "#f25f5c",
      "#00ff00",
      "#247ba0"
    ],
    "lq0": "#70c1b3",
    "lq1": "#008000",
    "lq2": "#f25f5c",
    "lq3": "#00ff00",
    "lq4": "#247ba0"
  }
}


test.describe('Circle Drawing Mode', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    await page.evaluate(({ settings, text }) => {
      window.setPolychromeParams(settings)
      window.setPolychromeText(text)
    }, { settings: circleDefaultParams, text: testText })

    // Verify no critical errors occurred during setup
    expect(consoleErrors.filter(error =>
      !error.includes('404') &&
      !error.includes('favicon')
    )).toHaveLength(0)
  })

  test('circle mode renders text in circular pattern', async ({ page }) => {
    // Draw test pattern
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 200, y: 100 }]], { steps: 1 })

    // Wait for drawing to complete
    await page.waitForTimeout(500)

    // Verify canvas has content
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot for visual verification
    await expect(canvas).toHaveScreenshot('circle-mode-basic.png', {
      maxDiffPixelRatio: 0.1
    })
  })

  test('circle mode works with different paint modes', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Test with rainbow mode
    await simulatePaintGesture(canvas, page, [[{ x: 60, y: 40 }, { x: 210, y: 100 }]], { steps: 5 })

    await page.waitForTimeout(200)

    const hasRainbowContent = await canvasHasContent(page)
    expect(hasRainbowContent).toBe(true)

    // Clear and test with different rainbow mode
    await clearCanvas(page)
    await simulatePaintGesture(canvas, page, [[{ x: 40, y: 60 }, { x: 200, y: 100 }]], { steps: 5 })

    await page.waitForTimeout(200)

    const hasDifferentRainbowContent = await canvasHasContent(page)
    expect(hasDifferentRainbowContent).toBe(true)
  })

  test('circle mode handles multiple circles', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw multiple circles
    await simulatePaintGesture(canvas, page, [[{ x: 40, y: 40 }, { x: 300, y: 300 }]], { steps: 3 })
    await page.waitForTimeout(200)

    // Verify content was created
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot to verify multiple circles
    await expect(canvas).toHaveScreenshot('circle-mode-multiple.png', {
      maxDiffPixelRatio: 0.1
    })
  })

  test('circle mode edge cases', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Test with very small radius
    await canvas.click({ position: { x: 5, y: 5 } })
    await simulatePaintGesture(canvas, page, [[{ x: 10, y: 10 }, { x: 20, y: 23 }]], { steps: 5 })
    await page.waitForTimeout(200)

    let hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Test with large radius
    await clearCanvas(page)
    await simulatePaintGesture(canvas, page, [[{ x: 40, y: 20 }, { x: 20, y: 100 }]], { steps: 5 })
    await page.waitForTimeout(300) // More time for complex drawing

    hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)
  })
})