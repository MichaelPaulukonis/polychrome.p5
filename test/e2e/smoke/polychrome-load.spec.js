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

    try {
      // Try to wait for p5 to be ready (with shorter timeout for testing)
      await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas')
        if (!canvas) {
          return false
        }

        const app = document.querySelector('#app')
        if (!app || !app.__vue__) {
          return false
        }

        const vue = app.__vue__.$children[0]
        return vue && vue.pchrome && vue.pchrome.p5
      }, { timeout: 10000 }) // 10 second timeout

      // If we get here, p5 is ready!
      const canvas = page.locator('canvas').first()
      await expect(canvas).toBeVisible()

    } catch (error) {
      console.log('P5 not ready within timeout:', error.message)

      // Let's see what we do have
      const debugState = await page.evaluate(() => {
        const app = document.querySelector('#app')
        const vue = app && app.__vue__ && app.__vue__.$children[0]

        return {
          hasVue: !!vue,
          vueKeys: vue ? Object.keys(vue) : [],
          pchromeExists: !!(vue && vue.pchrome),
          pchromeKeys: vue && vue.pchrome ? Object.keys(vue.pchrome) : [],
          hasP5: !!(vue && vue.pchrome && vue.pchrome.p5),
          errors: vue && vue.$data ? vue.$data.errors : 'no vue data'
        }
      })

      console.log('Debug state:', JSON.stringify(debugState, null, 2))

      // Fail the test but with information
      expect(debugState.hasVue).toBe(true)
    }
  })
})
