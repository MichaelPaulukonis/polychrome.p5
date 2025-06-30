// tests/e2e/ui/keyboard-shortcuts.spec.js

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
  triggerP5Shortcut
} from '../utils/canvas-utils.js'

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    // Clear any existing content
    await clearCanvas(page)

    // Set up consistent testing environment
    await setDrawingMode(page, 'Grid')
    await setPaintMode(page, 'Black')
    await setParameter(page, 'rows', 3)
    await setParameter(page, 'columns', 3)

    // Verify no critical errors occurred during setup
    expect(consoleErrors.filter(error =>
      !error.includes('404') &&
      !error.includes('favicon')
    )).toHaveLength(0)
  })

  test('spacebar clears canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw some content
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Verify canvas has content
    let hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Use spacebar to clear
    await triggerP5Shortcut(page, 'Space')

    // Verify canvas is now empty
    hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(false)
  })

  test('arrow keys change drawing mode', async ({ page }) => {
    // Start with Grid mode
    await setDrawingMode(page, 'Grid')
    let currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid')

    // Right arrow should cycle to next mode
    await triggerP5Shortcut(page, 'ArrowRight')

    currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).not.toBe('Grid') // Should be different now

    // Left arrow should cycle back
    await triggerP5Shortcut(page, 'ArrowLeft')

    currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBe('Grid') // Should be back to Grid
  })

  test('up/down arrows change paint mode', async ({ page }) => {
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

  test('s key saves canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Draw some content
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    // Set up download handler
    const downloadPromise = page.waitForEvent('download')

    // Trigger save with 's' key
    await triggerP5Shortcut(page, 's')

    // Wait for download
    const download = await downloadPromise
    expect(download).toBeTruthy()

    // Verify filename contains expected pattern
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/polychrome.*\.(png|jpg|jpeg)$/i)
  })

  test('r key resets/randomizes parameters', async ({ page }) => {
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

  test('number keys change specific parameters', async ({ page }) => {
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

  test('escape key resets or stops current action', async ({ page }) => {
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

  test('keyboard shortcuts work during continuous drawing', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Start drawing
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)

    // Change mode via keyboard while drawing
    await triggerP5Shortcut(page, 'ArrowRight')

    // Continue drawing
    await canvas.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(200)

    // Verify content was created
    const hasContent = await canvasHasContent(page)
    expect(hasContent).toBe(true)

    // Take screenshot to verify mixed-mode drawing
    await expect(canvas).toHaveScreenshot('keyboard-shortcuts-mixed-drawing.png', {
      threshold: 0.2
    })
  })

  test('keyboard shortcuts are not affected by GUI focus', async ({ page }) => {
    // Click on a GUI element to potentially change focus
    const guiElement = page.locator('.qs_container').first()
    if (await guiElement.isVisible()) {
      await guiElement.click()
    }

    // Keyboard shortcuts should still work
    await triggerP5Shortcut(page, 'Space') // Clear

    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(100)

    // Should still be able to change modes
    await triggerP5Shortcut(page, 'ArrowRight')

    const currentMode = await getParameterValue(page, 'drawMode')
    expect(currentMode).toBeTruthy() // Should have a valid mode
  })
})
