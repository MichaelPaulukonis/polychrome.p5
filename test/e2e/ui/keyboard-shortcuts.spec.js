// tests/e2e/ui/keyboard-shortcuts.spec.js

import { test, expect } from '@playwright/test'
import {
  canvasHasContent,
  getCanvasData,
  setupConsoleErrorTracking,
  simulatePaintGesture,
  triggerP5Shortcut,
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
  "drawMode": "Grid",
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

test.describe('Keyboard Shortcuts', () => {
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

  test('DELETE clears canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw some content
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 200, y: 100 }]])
    await page.waitForTimeout(200)

    const initialImageData = await getCanvasData(page)

    // Verify canvas has content
    let hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Use Delete to clear
    await triggerP5Shortcut(page, 'Delete')

    // Verify canvas is now empty
    const hadContentBefore = await canvasHasContent(page, initialImageData)
    expect(hadContentBefore).toBe(true)
  })

  test('CMD+s key saves canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw some content
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 200, y: 100 }]])
    await page.waitForTimeout(200)

    // Set up download handler
    const downloadPromise = page.waitForEvent('download')

    await triggerP5Shortcut(page, 'ControlOrMeta+s')

    // Wait for download
    const download = await downloadPromise
    expect(download).toBeTruthy()

    // Verify filename contains expected pattern
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/polychrome.*\.(png|jpg|jpeg)$/i)
  })
})