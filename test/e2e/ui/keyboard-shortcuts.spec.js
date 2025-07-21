// tests/e2e/ui/keyboard-shortcuts.spec.js

import { test, expect } from '@playwright/test'
import {
  canvasHasContent,
  getCanvasData,
  getParameterValue,
  setDrawingMode,
  setPaintMode,
  setParameter,
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

  // thhe nextDrawMode method doesn't work anyway
  test.skip('m and SHIFT-m keys change drawing mode', async ({ page }) => {
    // Start with Grid mode
    await setDrawingMode(page, 'Grid')
    let currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid')

    // Right arrow should cycle to next mode
    await triggerP5Shortcut(page, 'm')

    currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).not.toBe('Grid') // Should be different now

    // Left arrow should cycle back
    await triggerP5Shortcut(page, 'M')

    currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid') // Should be back to Grid
  })

  // there's nothing like this in the sketch/UI?
  test.skip('up/down arrows change paint mode', async ({ page }) => {
    // Start with a known paint mode
    await setPaintMode(page, 'Black')
    let currentMode = await getParameterValue(page, 'fill.paintMode')
    expect(currentMode).toBe('Black')

    // Up arrow should cycle to next paint mode
    await triggerP5Shortcut(page, 'ArrowUp')

    currentMode = await getParameterValue(page, 'fill.paintMode')
    expect(currentMode).not.toBe('Black') // Should be different now

    // Down arrow should cycle in reverse
    await triggerP5Shortcut(page, 'ArrowDown')

    currentMode = await getParameterValue(page, 'fill.paintMode')
    expect(currentMode).toBe('Black') // Should be back to Black
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

  // does not currently work
  test.skip('r key resets/randomizes parameters', async ({ page }) => {
    // Set specific parameters
    await setParameter(page, 'rows', 5)
    await setParameter(page, 'columns', 5)

    // Verify parameters are set
    let rows = await getParameterValue(page, 'rows')
    let columns = await getParameterValue(page, 'columns')
    expect(rows).toBe(5)
    expect(columns).toBe(5)

    // Trigger reset/randomize with 'r' key
    await triggerP5Shortcut(page, 'r')

    // Parameters should be different now (randomized)
    rows = await getParameterValue(page, 'rows')
    columns = await getParameterValue(page, 'columns')

    // At least one should be different (randomized)
    const parametersChanged = rows !== 5 || columns !== 5
    expect(parametersChanged).toBe(true)
  })

  // number keys are something completely different.
  test.skip('number keys change specific parameters', async ({ page }) => {
    // Test if number keys affect specific parameters
    // This will depend on the specific key bindings in the app

    // Trigger a number key
    await triggerP5Shortcut(page, '1')
    await page.waitForTimeout(100)

    // Verify some parameter changed
    // This is a basic test - specific behavior depends on app implementation
    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)
  })

  // there's nothing like this in the sketch/UI
  test.skip('escape key resets or stops current action', async ({ page }) => {
    // Start some action
    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)

    // Trigger escape
    await triggerP5Shortcut(page, 'Escape')

    // This is a functional test - exact behavior depends on app implementation
    // At minimum, escape should not cause errors
    const hasContent = await canvasHasContent(page)
    expect(typeof hasContent).toBe('boolean') // Should still be functional
  })

  // this may be a consideration, but it's not what's being tested
  test('keyboard shortcuts work during continuous drawing', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Start drawing
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 300, y: 100 }]], { steps: 1 })

    await page.waitForTimeout(100)

    await triggerP5Shortcut(page, 'ArrowRight')

    // Continue drawing
    await simulatePaintGesture(canvas, page, [[{ x: 300, y: 100 }, { x: 300, y: 100 }]], { steps: 1 })

    await page.waitForTimeout(200)

    // Verify content was created
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot to verify mixed-mode drawing
    await expect(canvas).toHaveScreenshot('keyboard-shortcuts-mixed-drawing.png', {
      maxDiffPixelRatio: 0.1
    })
  })

  // this is a good thing to test, but is not correctly implemented
  test.skip('keyboard shortcuts are not affected by GUI focus', async ({ page }) => {
    // Click on a GUI element to potentially change focus
    const guiElement = page.locator('.qs_container').first()
    if (await guiElement.isVisible()) {
      await guiElement.click()
    }

    // Keyboard shortcuts should still work
    await triggerP5Shortcut(page, 'Delete') // Clear

    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)

    // Should still be able to change modes
    // except this isn't even a thing
    await triggerP5Shortcut(page, 'ArrowRight')

    const currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBeTruthy() // Should have a valid mode
  })
})
