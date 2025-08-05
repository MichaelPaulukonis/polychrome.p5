// tests/e2e/ui/basic-interaction.spec.js

import { test, expect } from '@playwright/test'
import {
  canvasHasContent,
  clearCanvas,
  getCanvasData,
  setDrawingMode,
  setParameter,
  simulatePaintGesture,
  waitForFontsLoaded,
  waitForP5Ready
} from '../utils/canvas-utils.js'

test.describe('Basic UI Interaction', () => {
  test('can interact with canvas and see changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Test multiple clicks to see if content accumulates
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 200, y: 100 }]])
    await page.waitForTimeout(200)

    const hasContent1 = await canvasHasContent(page)

    await canvas.click({ position: { x: 200, y: 150 } })
    await page.waitForTimeout(200)

    const hasContent2 = await canvasHasContent(page)

    // Both should have content
    expect(hasContent1).toBe(true)
    expect(hasContent2).toBe(true)
  })

  test('can clear canvas using clear button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()

    // Get the initial state of the canvas after it's cleared on load.
    const initialImageData = await getCanvasData(page)

    // Set drawing mode and parameters to ensure a click produces content.
    await setDrawingMode(page, 'Grid');
    await setParameter(page, 'rows', 3);
    await setParameter(page, 'columns', 3);

    // Draw something first
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 200, y: 100 }]])

    await page.waitForTimeout(200)

    await page.screenshot({ path: 'test-results/draw-before-clear.png', fullPage: true })

    const hasContentBefore = await canvasHasContent(page, initialImageData)
    expect(hasContentBefore).toBe(true)

    // Use the robust utility to clear the canvas
    await clearCanvas(page);
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'test-results/draw-after-clear.png', fullPage: true })

    // pass in no image so function looks only at page
    // if canvas is monochrome, it counts as "no content"
    const hasContentAfter = await canvasHasContent(page)
    console.log('Canvas has content after clear:', hasContentAfter)

    // Should be empty after clear
    expect(hasContentAfter).toBe(false)
  })
})
