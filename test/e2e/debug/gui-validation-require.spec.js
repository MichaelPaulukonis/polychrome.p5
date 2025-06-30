// Simplified validation test using require syntax to avoid Jest issues
const { test, expect } = require('@playwright/test')

test('QuickSettings GUI validation', async ({ page }) => {
  // Navigate and wait for basic page load
  await page.goto('/')
  await page.waitForLoadState('load')

  // Wait for fonts
  await page.waitForFunction(() => document.fonts.ready)

  // Wait for p5
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return false

    const app = document.querySelector('#app')
    if (!app || !app.__vue__) return false

    const rootVue = app.__vue__
    return rootVue.$data && rootVue.$data.pchrome && rootVue.$data.pchrome.p5
  })

  // Wait for QuickSettings GUI (with longer timeout)
  await page.waitForFunction(() => {
    const panels = document.querySelectorAll('.qs_panel')
    return panels.length > 0
  }, { timeout: 10000 })

  // Take screenshots
  await page.screenshot({ path: 'test-results/validation-before-expand.png', fullPage: true })

  // Expand panels
  await page.evaluate(() => {
    const panels = document.querySelectorAll('.qs_panel')
    panels.forEach(panel => {
      const titleBar = panel.querySelector('.qs_title_bar')
      if (titleBar) {
        titleBar.click()
      }
    })
  })

  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'test-results/validation-after-expand.png', fullPage: true })

  // Extract GUI structure
  const guiData = await page.evaluate(() => {
    const result = {
      qsPanels: [],
      buttons: [],
      selects: [],
      inputs: []
    }

    // QuickSettings panels
    document.querySelectorAll('.qs_panel').forEach((panel, i) => {
      result.qsPanels.push({
        index: i,
        className: panel.className,
        visible: panel.offsetParent !== null,
        title: panel.querySelector('.qs_title_bar')?.textContent?.trim() || ''
      })
    })

    // All buttons
    document.querySelectorAll('input[type="button"], button').forEach((btn, i) => {
      result.buttons.push({
        index: i,
        tagName: btn.tagName,
        type: btn.type || '',
        value: btn.value || '',
        text: btn.textContent?.trim() || '',
        className: btn.className || '',
        visible: btn.offsetParent !== null
      })
    })

    // All selects
    document.querySelectorAll('select').forEach((select, i) => {
      result.selects.push({
        index: i,
        className: select.className || '',
        options: Array.from(select.options).map(opt => opt.value),
        visible: select.offsetParent !== null
      })
    })

    return result
  })

  // Write results to console (this should show in test output)
  console.log('=== QuickSettings Validation Results ===')
  console.log(`Found ${guiData.qsPanels.length} QS panels`)
  console.log(`Found ${guiData.buttons.length} buttons`)
  console.log(`Found ${guiData.selects.length} selects`)

  console.log('QS Panels:', JSON.stringify(guiData.qsPanels, null, 2))
  console.log('Buttons:', JSON.stringify(guiData.buttons, null, 2))
  console.log('Selects:', JSON.stringify(guiData.selects, null, 2))

  // Test basic assertions
  expect(guiData.qsPanels.length).toBeGreaterThan(0)
  expect(guiData.buttons.length).toBeGreaterThan(0)

  // Test for clear button specifically
  const clearButton = guiData.buttons.find(btn =>
    btn.value === 'clear' || btn.text === 'clear'
  )

  console.log('Clear button found:', !!clearButton)
  if (clearButton) {
    console.log('Clear button details:', JSON.stringify(clearButton, null, 2))
  }

  expect(clearButton).toBeTruthy()
})
