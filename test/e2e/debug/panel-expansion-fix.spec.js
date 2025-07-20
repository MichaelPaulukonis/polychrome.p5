// Quick validation test for panel expansion fix
import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  waitForQuickSettingsReady,
  clearCanvas,
  setDrawingMode
} from '../utils/canvas-utils.js'

test.describe('Panel Expansion Fix Validation', () => {
  test('clear button works', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Wait for everything to be ready
    await waitForP5Ready(page)
    await waitForQuickSettingsReady(page)

    // Test using the clearCanvas utility function
    await clearCanvas(page)
    console.log('clearCanvas() utility worked!')
  })

  test('drawing mode dropdown works', async ({ page }) => {
    await page.goto('/')
    await waitForP5Ready(page)
    await waitForQuickSettingsReady(page)

    // Find and interact with drawing mode dropdown
    await setDrawingMode(page, 'Circle')
    console.log('Drawing mode changed to Circle successfully!')
  })
})
