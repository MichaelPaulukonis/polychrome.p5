// test/e2e/debug/screenshot-on-load.spec.js
import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForQuickSettingsReady } from '../utils/canvas-utils.js'

test('take screenshot on load', async ({ page }) => {
  await page.goto('/')
  await waitForP5Ready(page)
  await waitForQuickSettingsReady(page)
  await page.screenshot({ path: 'test-results/screenshot-on-load.png', fullPage: true })
})
