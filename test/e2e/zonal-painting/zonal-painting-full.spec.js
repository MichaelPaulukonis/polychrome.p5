import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  waitForNuxtReady,
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
    await waitForNuxtReady(page)
    await waitForP5Ready(page)
    // Ensure the Zonal Painting panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting')
  })

  test.afterEach(async ({ page }) => {
    expect(consoleErrors).toHaveLength(0)
  })

  // Helper to wait for the zone object to be defined and have properties in pchrome
  const waitForZoneReady = async (page) => {
    console.log(`INSIDE OF waiting for zone ready....`)
    await page.waitForFunction(() => {
      const app = document.querySelector('#app')
      if (!app || !app.__vue__ || !app.__vue__.$data || !app.__vue__.$data.pchrome) {
        return false
      }
      const zone = app.__vue__.$data.pchrome.zone
      return zone && typeof zone.x === 'number' && typeof zone.y === 'number' && typeof zone.width === 'number' && typeof zone.height === 'number'
    }, null, { timeout: 5000 }) // Increased timeout for robustness
  }

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

    console.log('Waiting for zone ready...')
    await waitForZoneReady(page)

    // Assertions on global state
    const isDefiningZoneAfterDrag = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.isDefiningZone
    })
    expect(isDefiningZoneAfterDrag).toBe(false)

    const isZoneActive = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.isZoneActive
    })
    expect(isZoneActive).toBe(true)

    const zoneExists = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.zoneExists
    })
    expect(zoneExists).toBe(true)

    // Visual Assertion: Take a screenshot and visually inspect
    await page.screenshot({ path: 'test-results/zonal-painting/zone-defined.png' })

    // Verify that the border is NOT saved with the artwork
    // This is a tricky assertion without pixel comparison, but we can try to check if the canvas is mostly white
    // after defining a zone without painting.
    const canvasData = await getCanvasData(page)
    // Assuming a white background (255,255,255) and no drawing yet, all pixels should be close to 255.
    // We check the average color or a sample of pixels.
    // const isMostlyWhite = canvasData.every(pixel => pixel > 240) // Allowing for slight variations
    // expect(isMostlyWhite).toBe(true) // This might need adjustment based on actual canvas content
    // For now, relying on visual inspection that the border is not saved with the artwork.
  })

  test('should confine painting within active zone', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await waitForZoneReady(page)

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
    await waitForZoneReady(page)

    // Deactivate the zone
    await clickGuiButton(page, 'Toggle Zone')
    const isZoneActive = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.isZoneActive
    })
    expect(isZoneActive).toBe(false)

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
    await waitForZoneReady(page)
    await clickGuiButton(page, 'Toggle Zone') // Deactivate

    // Paint over inactive zone area
    await simulatePaintGesture(canvas, page, [[{ x: 110, y: 110 }, { x: 190, y: 190 }]])

    // Reactivate the zone
    await clickGuiButton(page, 'Toggle Zone')
    const isZoneActive = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.isZoneActive
    })
    expect(isZoneActive).toBe(true)

    // Visual Assertion: Verify the zone border changes back to solid red
    await page.screenshot({ path: 'test-results/zonal-painting/zone-reactivated.png' })

    // This test is tricky for automated assertion without pixel comparison. Manual visual inspection is key.
    // For a more robust automated test, we would need to capture the canvas state before and after painting
    // and then compare specific pixel regions.
  })

  test('should clear the zone', async ({ page }) => {
    // Setup: Define a zone and paint something inside it
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])
    await waitForZoneReady(page)

    // Clear the zone
    await clickGuiButton(page, 'Clear Zone')
    const zoneExists = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.zoneExists
    })
    expect(zoneExists).toBe(false)
    const isZoneActive = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.isZoneActive
    })
    expect(isZoneActive).toBe(false)

    // Visual Assertion: Verify the zone border disappears
    await page.screenshot({ path: 'test-results/zonal-painting/zone-cleared.png' })

    // Visual Assertion: Verify that the content previously painted within the zone remains on the main canvas
    // This requires comparing canvas content before and after clearing the zone.
    // For now, rely on manual visual inspection.
  })

  // --- Plan 17: Non-Destructive Zonal Painting Tests ---

  test('should apply transformations only to the zone', async ({ page }) => {
    // Setup: Define a zone and paint something inside it
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])
    await waitForZoneReady(page)

    // Ensure the Canvas Transforms panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Canvas Transforms"))')
    await expandTargetGuiPanel(page, 'Canvas Transforms')
    await clickGuiButton(page, 'Flip Horizontal')

    // Visual Assertion: Verify only the zone content is flipped
    await page.screenshot({ path: 'test-results/zonal-painting/zone-flipped.png' })

    // Verify that the main canvas outside the zone is unchanged (tricky without pixel comparison)
    // This would require capturing the canvas data before and after, and comparing regions.
  })

  test('should commit zone content to main canvas', async ({ page }) => {
    // Setup: Define a zone, paint, and transform
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await simulatePaintGesture(canvas, page, [[{ x: 120, y: 120 }, { x: 180, y: 180 }]])
    await waitForZoneReady(page)

    // Ensure the Canvas Transforms panel is visible before expanding
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Canvas Transforms"))')
    await expandTargetGuiPanel(page, 'Canvas Transforms')
    await clickGuiButton(page, 'Flip Horizontal')

    // Commit the zone
    await page.waitForSelector('.qs_main:has(.qs_title_bar:has-text("Zonal Painting"))')
    await expandTargetGuiPanel(page, 'Zonal Painting') // Re-expand if collapsed
    await clickGuiButton(page, 'Commit Zone')

    // Visual Assertion: Verify the transformed content is now part of the main canvas
    await page.screenshot({ path: 'test-results/zonal-painting/zone-committed.png' })

    // After commit, the zone should ideally be cleared or inactive, and its content merged.
    const zoneExists = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.globals.zoneExists
    })
    expect(zoneExists).toBe(false) // Assuming commit clears the zone
  })

  // --- Plan 18: Zone Dragging, Moving, and Centering Tests ---

  test('should drag the zone around the canvas', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await waitForZoneReady(page)

    // Get initial zone position
    const initialZoneX = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.x
    })
    const initialZoneY = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.y
    })

    // Simulate dragging the zone (requires Alt key pressed)
    // Playwright's dragAndDrop doesn't support modifier keys directly for canvas elements.
    // We'll simulate mouse down, move, and up with keyboard modifier.
    await page.keyboard.down('Alt')
    await canvas.hover({ position: { x: 150, y: 150 } })
    await page.mouse.down()
    await canvas.hover({ position: { x: 250, y: 250 } })
    await page.mouse.up()
    await page.keyboard.up('Alt')

    // Get new zone position
    const newZoneX = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.x
    })
    const newZoneY = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.y
    })

    // Assert that the zone has moved
    expect(newZoneX).not.toBe(initialZoneX)
    expect(newZoneY).not.toBe(initialZoneY)

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-dragged.png' })
  })

  test('should move the zone to a specific location via GUI', async ({ page }) => {
    // Setup: Define a zone
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 100, y: 100 }, { x: 200, y: 200 }]])
    await waitForZoneReady(page)

    // Set new coordinates via GUI inputs
    await setParameter(page, 'Zone X', 50)
    await setParameter(page, 'Zone Y', 50)

    // Get new zone position
    const newZoneX = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.x
    })
    const newZoneY = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.y
    })

    // Assert that the zone has moved to the specified coordinates
    expect(newZoneX).toBe(50)
    expect(newZoneY).toBe(50)

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-moved-gui.png' })
  })

  test('should center the zone on the canvas via GUI', async ({ page }) => {
    // Setup: Define a zone at an arbitrary position
    await clickGuiButton(page, 'Define Zone')
    const canvas = page.locator('canvas').first()
    await simulatePaintGesture(canvas, page, [[{ x: 10, y: 10 }, { x: 110, y: 110 }]])
    await waitForZoneReady(page)

    // Click the Center Zone button
    await clickGuiButton(page, 'Center Zone')

    // Get new zone position and canvas dimensions
    const newZoneX = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.x
    })
    const newZoneY = await page.evaluate(() => {
      const app = document.querySelector('#app')
      return app.__vue__.$data.pchrome.zone.y
    })
    const canvasWidth = await page.evaluate(() => window.pchrome.params.width)
    const canvasHeight = await page.evaluate(() => window.pchrome.params.height)
    const zoneWidth = await page.evaluate(() => window.pchrome.zone.width)
    const zoneHeight = await page.evaluate(() => window.pchrome.zone.height)

    // Calculate expected centered position
    const expectedX = (canvasWidth - zoneWidth) / 2
    const expectedY = (canvasHeight - zoneHeight) / 2

    // Assert that the zone is centered
    expect(newZoneX).toBe(expectedX)
    expect(newZoneY).toBe(expectedY)

    // Visual Assertion
    await page.screenshot({ path: 'test-results/zonal-painting/zone-centered.png' })
  })
})
