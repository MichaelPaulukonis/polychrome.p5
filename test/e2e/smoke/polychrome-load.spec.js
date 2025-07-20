// tests/e2e/smoke/polychrome-load.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready } from '../utils/canvas-utils.js'

test.describe('Polychrome Load Test', () => {
  test('wait for polychrome to fully load', async ({ page }) => {
    await page.goto('/')

    // Wait longer for the Vue component to mount and p5.js to initialize
    await page.waitForTimeout(2000)

    // Check detailed state
    const state = await page.evaluate(() => {
      const app = document.querySelector('#app')
      const canvas = document.querySelector('canvas')

      return {
        hasApp: !!app,
        hasVue: !!(app && app.__vue__),
        hasChildren: !!(app && app.__vue__ && app.__vue__.$children),
        childrenCount: app && app.__vue__ ? app.__vue__.$children.length : 0,
        hasCanvas: !!canvas,
        canvasVisible: canvas ? canvas.style.display !== 'none' : false,
        sketchHolder: !!document.querySelector('#sketch-holder'),
        vueData: app && app.__vue__ && app.__vue__.$children[0] ?
          Object.keys(app.__vue__.$children[0].$data || {}) : []
      }
    })

    console.log('Detailed state:', JSON.stringify(state, null, 2))

    expect(state.hasApp).toBe(true)
    expect(state.hasVue).toBe(true)
  })

  test('try waiting for p5 with our utility', async ({ page }) => {
    await page.goto('/')

    // Use the centralized utility to wait for p5
    await waitForP5Ready(page)

    // If we get here, p5 is ready!
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
  })
})
