import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  setupConsoleErrorTracking,
  clickGuiButton,
  simulatePaintGesture,
  canvasHasContent,
  expandTargetGuiPanel,
  getCanvasData,
  setParameter
} from '../utils/canvas-utils.js'

test.describe('Zonal Painting and Manipulation E2E Tests', () => {
  let consoleErrors

  test.beforeEach(async ({ page }) => {
    consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await waitForP5Ready(page)
    // Ensure the Zonal Painting panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting')
  })

  test.afterEach(async ({ page }) => {
    expect(consoleErrors).toHaveLength(0)
  })

  // --- Plan 16: Zonal Painting Implementation Tests ---

  test('should define a zone and show visual feedback without saving border', async ({ page }) => {
    // Test Case 1: Zone Definition and Visual Feedback
    await clickGuiButton(page, 'Define Zone')

    // Simulate mouse drag to define a zone
    const canvas = page.locator('canvas').first()
    const startPoint = { x: 100, y: 100 }
    const endPoint = { x: 200, y: 200 }
    await simulatePaintGesture(canvas, page, [[startPoint, endPoint]])
    await page.waitForTimeout(500)

    // Visual Assertion: Take a screenshot and visually inspect
    await page.screenshot({ path: 'test-results/zonal-painting/zone-defined.png' })
  })

  test('should confine painting within active zone', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])

    // Simulate painting inside the defined zone
    const initialImageData = await getCanvasData(page) // Canvas state before any paint
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])
    await page.screenshot({ path: 'test-results/zonal-painting/painted-inside-zone.png' })
    const hasContentInside = await canvasHasContent(page, initialImageData) // Should be true if content was added
    expect(hasContentInside).toBe(true)

    // Simulate painting outside the defined zone - should NOT paint on main canvas
    const imageDataAfterInsidePaint = await getCanvasData(page) // Canvas state after inside paint
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 80, y: 80 }]])
    await page.screenshot({ path: 'test-results/zonal-painting/painted-outside-zone.png' })
    const hasContentOutside = await canvasHasContent(page, imageDataAfterInsidePaint) // Should be false if no new content
    expect(hasContentOutside).toBe(false)
  })

  test('should deactivate zone and allow main canvas painting', async ({ page }) => {
    // Setup: Define a zone and paint something inside it
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])

    // Deactivate the zone
    await clickGuiButton(page, 'Toggle Zone')

    // Visual Assertion: Verify the zone border changes to dashed gray
    await page.screenshot({ path: 'test-results/zonal-painting/zone-deactivated.png' })

    // Simulate painting anywhere on the canvas
    const initialImageData = await getCanvasData(page)
    await simulatePaintGesture(canvas, page, [[{ x: 50, y: 50 }, { x: 80, y: 80 }]])
    await page.screenshot({ path: 'test-results/zonal-painting/painted-on-main-canvas.png' })
    const hasContentOutside = await canvasHasContent(page, initialImageData)
    expect(hasContentOutside).toBe(true)
  })

  test('should reactivate zone and preserve content', async ({ page }) => {
    // Setup: Define a zone, paint in it, then deactivate it. Paint something on the main canvas over the inactive zone area.
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])
    await clickGuiButton(page, 'Toggle Zone') // Deactivate

    // Paint over inactive zone area
    await simulatePaintGesture(canvas, page, [[{ x: 110, y: 110 }, { x: 190, y: 190 }]])

    // Reactivate the zone
    await clickGuiButton(page, 'Toggle Zone')

    // Visual Assertion: Verify the zone border changes back to solid red
    await page.screenshot({ path: 'test-results/zonal-painting/zone-reactivated.png' })
  })

  test('should clear the zone', async ({ page }) => {
    // Setup: Define a zone and paint something inside it
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])

    // Clear the zone
    await clickGuiButton(page, 'Clear Zone')

    // Visual Assertion: Verify the zone border disappears
    await page.screenshot({ path: 'test-results/zonal-painting/zone-cleared.png' })
  })

  // --- Plan 17: Non-Destructive Zonal Painting Tests ---

  test('should apply transformations only to the zone', async ({ page }) => {
    // Setup: Define a zone and paint something inside it
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])

    // Ensure the Zonal Painting panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting')
    await clickGuiButton(page, 'Flip Zone H')

    // Visual Assertion: Verify only the zone content is flipped
    await page.screenshot({ path: 'test-results/zonal-painting/zone-flipped.png' })
  })

  test('should commit zone content to main canvas', async ({ page }) => {
    // Setup: Define a zone, paint, and transform
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])

    // Ensure the Zonal Painting panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting')
    await clickGuiButton(page, 'Flip Zone H')

    // Commit the zone
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting') // Re-expand if collapsed
    await clickGuiButton(page, 'Commit Zone')

    // Visual Assertion: Verify the transformed content is now part of the main canvas
    await page.screenshot({ path: 'test-results/zonal-painting/zone-committed.png' })
  })

  // --- Plan 18: Zone Dragging, Moving, and Centering Tests ---

  test('should drag the zone around the canvas', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])

    // Simulate dragging the zone (requires Alt key pressed)
    // Playwright's dragAndDrop doesn't support modifier keys directly for canvas elements.
    // We'll simulate mouse down, move, and up with keyboard modifier.
    await page.keyboard.down('Alt')
    await canvas.hover({ position: { x: 150, y: 150 } })
    await page.mouse.down()
    await canvas.hover({ position: { x: 250, y: 250 } })
    await page.mouse.up()
    await page.keyboard.up('Alt')

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-dragged.png' })
  })

  test('should move the zone to a specific location via GUI', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])

    // Set new coordinates via GUI inputs
    await setParameter(page, 'Zone X', 50)
    await setParameter(page, 'Zone Y', 50)

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-moved-gui.png' })
  })

  test('should center the zone on the canvas via GUI', async ({ page }) => {
    // Setup: Define a zone at an arbitrary position
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 10, y: 10 }, { x: 110, y: 110 }]])

    // Click the Center Zone button
    await clickGuiButton(page, 'Center Zone')

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-centered.png' })
  })
})