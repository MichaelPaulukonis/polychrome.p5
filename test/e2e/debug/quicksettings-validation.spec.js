// test/e2e/debug/quicksettings-validation.spec.js

import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForFontsLoaded } from '../utils/canvas-utils.js'

test.describe('QuickSettings Validation', () => {
  test('find clear button with correct selector', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)
    await page.waitForTimeout(1000)

    // Check if the QuickSettings clear button exists
    const clearButton = page.locator('input[type="button"][value="clear"].qs_button')
    const buttonExists = await clearButton.count()

    console.log('Clear button found with QuickSettings selector:', buttonExists > 0)

    if (buttonExists === 0) {
      // Debug: find all buttons and inputs
      const allButtons = await page.evaluate(() => {
        const buttons = []

        // Find all input[type="button"] elements
        document.querySelectorAll('input[type="button"]').forEach((btn, i) => {
          buttons.push({
            type: 'input[type="button"]',
            index: i,
            value: btn.value,
            className: btn.className,
            id: btn.id
          })
        })

        // Find all button elements
        document.querySelectorAll('button').forEach((btn, i) => {
          buttons.push({
            type: 'button',
            index: i,
            text: btn.textContent?.trim(),
            className: btn.className,
            id: btn.id
          })
        })

        return buttons
      })

      console.log('All button-like elements found:', JSON.stringify(allButtons, null, 2))
    }

    // For now, just check that we can load the page
    expect(await page.title()).toBeTruthy()
  })

  test('find drawing mode dropdown', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)
    await page.waitForTimeout(1000)

    // Check for select elements
    const allSelects = await page.evaluate(() => {
      const selects = []

      document.querySelectorAll('select').forEach((select, i) => {
        const options = Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.textContent?.trim()
        }))

        selects.push({
          index: i,
          name: select.name,
          id: select.id,
          className: select.className,
          selectedValue: select.value,
          options: options
        })
      })

      return selects
    })

    console.log('All select elements found:', JSON.stringify(allSelects, null, 2))

    // Look for one that has Grid, Circle options
    const drawModeSelect = allSelects.find(select =>
      select.options.some(opt => ['Grid', 'Circle', 'Grid2'].includes(opt.value))
    )

    console.log('Drawing mode select found:', !!drawModeSelect)
    if (drawModeSelect) {
      console.log('Drawing mode select details:', drawModeSelect)
    }

    expect(await page.title()).toBeTruthy()
  })
})
