// Simplified validation test using require syntax to avoid Jest issues
const { test, expect } = require('@playwright/test')
const { waitForP5Ready, waitForQuickSettingsReady, expandAllGuiPanels } = require('../utils/canvas-utils.js')

test('QuickSettings GUI validation', async ({ page }) => {
  // Navigate and wait for basic page load
  await page.goto('/')
  await page.waitForLoadState('load')

  // Wait for fonts and p5
  await page.waitForFunction(() => document.fonts.ready)
  await waitForP5Ready(page)

  // Wait for QuickSettings GUI
  await waitForQuickSettingsReady(page)

  await page.pause();

  await expandAllGuiPanels(page)

  // Take screenshot
  await page.screenshot({ path: 'test-results/validation.png', fullPage: true })

  // Extract GUI structure
  const guiData = await page.evaluate(() => {
    const result = {
      qsPanels: [],
      buttons: [],
      selects: []
    }

    // QuickSettings panels
    document.querySelectorAll('.qs_main').forEach((panel, i) => {
      result.qsPanels.push({
        index: i,
        className: panel.className,
        visible: panel.offsetParent !== null,
        title: panel.querySelector('.qs_title_bar')?.textContent?.trim() || '',
        isCollapsed: !panel.querySelector('.qs_content')
      })
    })

    // All QuickSettings buttons
    document.querySelectorAll('.qs_main input[type="button"].qs_button').forEach((btn, i) => {
      result.buttons.push({
        index: i,
        tagName: btn.tagName,
        type: btn.type || '',
        value: btn.value || '',
        className: btn.className || '',
        visible: btn.offsetParent !== null
      })
    })

    // All selects within QuickSettings panels
    document.querySelectorAll('.qs_main select').forEach((select, i) => {
      result.selects.push({
        index: i,
        className: select.className || '',
        options: Array.from(select.options).map(opt => opt.value),
        visible: select.offsetParent !== null
      })
    })

    return result
  })

  // Log results for debugging
  console.log('=== QuickSettings Validation Results ===')
  console.log(JSON.stringify(guiData, null, 2))

  // Assertions
  expect(guiData.qsPanels.length).toBeGreaterThan(0)
  expect(guiData.buttons.length).toBeGreaterThan(0)
  expect(guiData.selects.length).toBeGreaterThan(0)

  await page.pause();

  // Test for clear button specifically
  const clearButton = guiData.buttons.find(btn => btn.value === 'clear')
  console.log('Clear button found:', !!clearButton)
  expect(clearButton).toBeTruthy()
})
