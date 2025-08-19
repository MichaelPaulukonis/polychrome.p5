// tests/e2e/smoke/canvas-visibility.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForFontsLoaded } from '../utils/canvas-utils.js'

test.describe('Canvas Visibility', () => {
  test('main canvas is visible and interactive', async ({ page }) => {
    await page.goto('/')

    // Wait for fonts to load (critical for text-based p5.js app)
    await waitForFontsLoaded(page)

    // Wait for p5.js to be fully ready
    await waitForP5Ready(page)

    // Verify canvas exists and is visible
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Verify canvas has proper dimensions
    const canvasSize = await canvas.boundingBox()
    expect(canvasSize.width).toBeGreaterThan(0)
    expect(canvasSize.height).toBeGreaterThan(0)

    // Verify canvas is interactive (not covered by other elements)
    await canvas.click()
  })

  test('canvas has expected styling and is not hidden', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()

    // Check that canvas is not hidden or has zero opacity
    const canvasStyles = await canvas.evaluate(element => {
      const styles = window.getComputedStyle(element)
      return {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        position: styles.position
      }
    })

    expect(canvasStyles.display).not.toBe('none')
    expect(canvasStyles.visibility).not.toBe('hidden')
    expect(parseFloat(canvasStyles.opacity)).toBeGreaterThan(0)
  })

  test('canvas can be interacted with via mouse', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()

    // Try clicking at different positions
    await canvas.click({ position: { x: 100, y: 100 } })
    await canvas.click({ position: { x: 200, y: 150 } })

    // Verify that the clicks were processed (no errors thrown)
    // In a real drawing app, we might check for visual changes,
    // but for now we just verify the canvas remains responsive
    await expect(canvas).toBeVisible()
  })
})