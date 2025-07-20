// tests/e2e/smoke/basic-load.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready } from '../utils/canvas-utils.js'

test.describe('Basic Application Load', () => {
  test('page loads and ...', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads (basic HTML)
    await expect(page).toHaveURL(/.*localhost:\d+\/$/)

    // Check that there's some content (not just an error page)
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('check what global variables are available', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)

    // Let's see what's actually available in the global scope
    const globals = await page.evaluate(() => {
      const app = document.querySelector('#app')
      const p5Instance = app?.__vue__?.$data?.pchrome?.p5
      return {
        hasWindow: typeof window !== 'undefined',
        hasP5Instance: !!p5Instance,
        hasNuxt: typeof window.$nuxt !== 'undefined',
        hasP5: typeof window.p5 !== 'undefined',
        canvasCount: document.querySelectorAll('canvas').length,
        bodyContent: document.body.innerHTML.substring(0, 200)
      }
    })

    console.log('Global state:', globals)

    // Basic assertions
    expect(globals.hasWindow).toBe(true)
    expect(globals.canvasCount).toBeGreaterThanOrEqual(0)
  })
})
