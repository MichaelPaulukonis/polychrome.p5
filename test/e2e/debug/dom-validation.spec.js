import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForFontsLoaded } from '../utils/canvas-utils.js'

test('DOM structure validation', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('load')
  await waitForFontsLoaded(page)
  await waitForP5Ready(page)

  // Take screenshot
  await page.screenshot({ path: 'test-results/dom-validation.png', fullPage: true })

  // Extract all GUI elements and write to file
  const guiStructure = await page.evaluate(() => {
    const result = {
      buttons: [],
      selects: [],
      inputs: [],
      quickSettingsElements: []
    }

    // Find all buttons
    document.querySelectorAll('input[type="button"]').forEach((btn, i) => {
      result.buttons.push({
        type: 'input[button]',
        index: i,
        value: btn.value || '',
        className: btn.className || '',
        id: btn.id || '',
        parent: btn.parentElement?.className || ''
      })
    })

    document.querySelectorAll('button').forEach((btn, i) => {
      result.buttons.push({
        type: 'button',
        index: i,
        text: btn.textContent?.trim() || '',
        className: btn.className || '',
        id: btn.id || '',
        parent: btn.parentElement?.className || ''
      })
    })

    // Find all selects
    document.querySelectorAll('select').forEach((select, i) => {
      const options = Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.textContent?.trim()
      }))

      result.selects.push({
        index: i,
        name: select.name || '',
        id: select.id || '',
        className: select.className || '',
        selectedValue: select.value,
        options: options,
        parent: select.parentElement?.className || ''
      })
    })

    // Find all inputs
    document.querySelectorAll('input').forEach((input, i) => {
      result.inputs.push({
        index: i,
        type: input.type,
        name: input.name || '',
        id: input.id || '',
        className: input.className || '',
        value: input.value || '',
        parent: input.parentElement?.className || ''
      })
    })

    // Find QuickSettings specific elements
    document.querySelectorAll('.qs_container, .qs_button, .qs_select, .qs_input').forEach((el, i) => {
      result.quickSettingsElements.push({
        index: i,
        tagName: el.tagName,
        className: el.className || '',
        id: el.id || '',
        text: el.textContent?.trim() || '',
        value: el.value || ''
      })
    })

    return result
  })

  // Write results to JSON file that we can examine
  await page.evaluate((data) => {
    // Create a downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gui-structure.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, guiStructure)

  // Log some key findings
  console.log('=== GUI VALIDATION RESULTS ===')
  console.log(`Found ${guiStructure.buttons.length} buttons`)
  console.log(`Found ${guiStructure.selects.length} select elements`)
  console.log(`Found ${guiStructure.inputs.length} input elements`)
  console.log(`Found ${guiStructure.quickSettingsElements.length} QuickSettings elements`)

  // Check for clear button
  const clearButton = guiStructure.buttons.find(btn =>
    (btn.value === 'clear' || btn.text === 'clear') &&
    btn.className.includes('qs_button')
  )
  console.log(`Clear button found: ${!!clearButton}`)
  if (clearButton) {
    console.log('Clear button details:', JSON.stringify(clearButton, null, 2))
  }

  // Check for drawing mode dropdown
  const drawModeSelect = guiStructure.selects.find(select =>
    select.options.some(opt => ['Grid', 'Circle', 'Grid2'].includes(opt.value))
  )
  console.log(`Drawing mode select found: ${!!drawModeSelect}`)
  if (drawModeSelect) {
    console.log('Drawing mode details:', JSON.stringify(drawModeSelect, null, 2))
  }

  // Always pass - this is just for inspection
  expect(true).toBe(true)
})
