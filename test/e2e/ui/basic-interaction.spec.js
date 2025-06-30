// tests/e2e/ui/basic-interaction.spec.js

import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  waitForFontsLoaded,
  canvasHasContent
} from '../utils/canvas-utils.js'

test.describe('Basic UI Interaction', () => {
  test('can interact with canvas and see changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    // Test multiple clicks to see if content accumulates
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasContent1 = await canvasHasContent(page)
    console.log('Canvas has content after first click:', hasContent1)

    await canvas.click({ position: { x: 200, y: 150 } })
    await page.waitForTimeout(200)

    const hasContent2 = await canvasHasContent(page)
    console.log('Canvas has content after second click:', hasContent2)

    // Both should have content
    expect(hasContent1).toBe(true)
    expect(hasContent2).toBe(true)
  })

  test('can clear canvas using clear button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    const canvas = page.locator('canvas').first()

    // Draw something first
    await canvas.click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(200)

    const hasContentBefore = await canvasHasContent(page)
    expect(hasContentBefore).toBe(true)

    // Find and click the clear button
    const clearButton = page.locator('button').filter({ hasText: 'clear' })
    await clearButton.click()
    await page.waitForTimeout(300)

    const hasContentAfter = await canvasHasContent(page)
    console.log('Canvas has content after clear:', hasContentAfter)

    // Should be empty after clear
    expect(hasContentAfter).toBe(false)
  })
})
