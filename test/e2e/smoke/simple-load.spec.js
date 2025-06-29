// tests/e2e/smoke/simple-load.spec.js
import { test, expect } from '@playwright/test'

test.describe('Simple Load Test', () => {
  test('check what is actually loaded', async ({ page }) => {
    await page.goto('/')

    // Don't wait for networkidle, just wait for domcontentloaded
    await page.waitForLoadState('domcontentloaded')

    // Let's see what's actually available in the global scope
    const globals = await page.evaluate(() => {
      return {
        hasWindow: typeof window !== 'undefined',
        hasP5Instance: typeof window.p5Instance !== 'undefined',
        hasNuxt: typeof window.$nuxt !== 'undefined',
        hasP5: typeof window.p5 !== 'undefined',
        canvasCount: document.querySelectorAll('canvas').length,
        title: document.title,
        bodyClasses: document.body.className,
        hasPolychromeElements: document.querySelectorAll('[id*="polychrome"], [class*="polychrome"]').length,
        allScripts: Array.from(document.querySelectorAll('script')).map(s => s.src || s.innerHTML.substring(0, 50)).slice(-5)
      }
    })

    console.log('Page state:', JSON.stringify(globals, null, 2))

    // Basic assertions
    expect(globals.hasWindow).toBe(true)
    expect(globals.title).toBeTruthy()
  })
})
