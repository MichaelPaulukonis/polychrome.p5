// Manual GUI investigation
import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForFontsLoaded } from '../utils/canvas-utils.js'

test('manual GUI investigation', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('load')
  await waitForFontsLoaded(page)
  await waitForP5Ready(page)

  // Give time to see the page
  await page.waitForTimeout(5000)

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/gui-screenshot.png', fullPage: true })

  expect(await page.title()).toBeTruthy()
})
