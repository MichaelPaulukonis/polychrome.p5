// tests/e2e/smoke/polychrome-load.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, setupConsoleErrorTracking } from '../utils/canvas-utils.js'

test.describe('Polychrome Load Test', () => {
  test('wait for polychrome to fully load', async ({ page }) => {
    const consoleErrors = setupConsoleErrorTracking(page)
    await page.goto('/')
    await waitForP5Ready(page)

    const state = await page.evaluate(() => {
      const canvas = document.querySelector('canvas#defaultCanvas0')
      const sketchHolder = document.querySelector('div#sketch-holder')
      return {
        hasCanvas: !!canvas,
        canvasVisible: canvas ? window.getComputedStyle(canvas).display !== 'none' : false,
        sketchHolder: !!sketchHolder
      }
    })

    console.log('Detailed state:', JSON.stringify(state, null, 2))

    expect(state.hasCanvas).toBe(true)
    expect(state.canvasVisible).toBe(true)
    expect(state.sketchHolder).toBe(true)
    expect(consoleErrors).toHaveLength(0)
  })

  test('try waiting for p5 with our utility', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
  })
})