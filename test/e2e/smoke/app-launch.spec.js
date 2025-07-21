// tests/e2e/smoke/app-launch.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForNuxtReady, setupConsoleErrorTracking } from '../utils/canvas-utils.js'

test.describe('Application Launch', () => {
  test('application loads successfully without errors', async ({ page }) => {
    // Setup console error tracking before navigation
    const consoleErrors = setupConsoleErrorTracking(page)

    // Navigate to the application
    await page.goto('/')

    // Wait for Nuxt to be ready (client-side hydration)
    await waitForNuxtReady(page)

    // Wait for p5.js to initialize completely
    await waitForP5Ready(page)

    // Verify canvas is visible
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Verify p5.js instance exists and is ready
    const p5Ready = await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (!app || !app.__vue__) return false
      const instance = app.__vue__.$data.pchrome.p5
      return instance &&
             instance._setupDone &&
             typeof instance.draw === 'function'
    })
    expect(p5Ready).toBe(true)

    // Verify no critical errors occurred during load
    expect(consoleErrors).toHaveLength(0)
  })

  test('p5.js instance has required properties', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    // Check that p5.js instance has the expected properties for PolychromeText
    const p5Properties = await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (!app || !app.__vue__) return null
      const instance = app.__vue__.$data.pchrome.p5
      if (!instance) return null
      return {
        hasCanvas: !!instance.canvas,
        hasDrawMethod: typeof instance.draw === 'function',
        hasMousePressed: typeof instance.mousePressed === 'function',
        canvasWidth: instance.canvas?.width || 0,
        canvasHeight: instance.canvas?.height || 0
      }
    })

    expect(p5Properties.hasCanvas).toBe(true)
    expect(p5Properties.hasDrawMethod).toBe(true)
    expect(p5Properties.hasMousePressed).toBe(true)
    expect(p5Properties.canvasWidth).toBeGreaterThan(0)
    expect(p5Properties.canvasHeight).toBeGreaterThan(0)
  })
})
