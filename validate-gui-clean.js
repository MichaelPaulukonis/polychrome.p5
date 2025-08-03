#!/usr/bin/env node

// Direct Playwright test runner to bypass terminal issues
const { chromium } = require('playwright')

async function validateGUI () {
  console.log('Starting GUI validation...')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    // Navigate to the app
    console.log('Navigating to app...')
    await page.goto('/')
    await page.waitForLoadState('load')

    // Wait for fonts
    console.log('Waiting for fonts...')
    await page.waitForFunction(() => document.fonts.ready)

    // Wait for p5 AND QuickSettings GUI panels (even if collapsed)
    console.log('Waiting for p5 AND GUI panels...')
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) {
        return false
      }

      const app = document.querySelector('#app')
      if (!app || !app.__vue__) {
        return false
      }

      const rootVue = app.__vue__
      const p5Ready = rootVue.$data && rootVue.$data.pchrome && rootVue.$data.pchrome.p5

      // Check for QuickSettings panels (even if collapsed)
      const qsPanels = document.querySelectorAll('.qs_main')
      console.log(`Found ${qsPanels.length} QS panels`)

      return p5Ready && qsPanels.length > 0
    }, { timeout: 30000 })

    console.log('App and GUI panels ready!')

    // Take screenshot of collapsed panels first
    await page.screenshot({ path: './test-results/gui-collapsed.png', fullPage: true })

    // CRITICAL: Expand all panels by clicking their title bars
    console.log('Expanding all collapsed panels...')
    await page.evaluate(() => {
      const titleBars = document.querySelectorAll('.qs_title_bar')
      console.log(`Found ${titleBars.length} title bars to click`)

      titleBars.forEach((titleBar, i) => {
        console.log(`Clicking title bar ${i}: ${titleBar.textContent}`)
        titleBar.click()
      })
    })

    // Wait for panels to expand
    await page.waitForTimeout(1000)

    // Take screenshot of expanded panels
    await page.screenshot({ path: './test-results/gui-expanded.png', fullPage: true })

    // Validate clear button
    console.log('Looking for clear button...')
    const clearButton = await page.locator('input[type="button"][value="clear"].qs_button').count()
    console.log(`Clear button found: ${clearButton > 0} (count: ${clearButton})`)

    // If not found, debug button structure
    if (clearButton === 0) {
      console.log('Debugging button structure...')
      const allButtons = await page.evaluate(() => {
        const buttons = []

        document.querySelectorAll('input[type="button"]').forEach((btn, i) => {
          buttons.push({
            type: 'input[button]',
            index: i,
            value: btn.value || '',
            className: btn.className || '',
            id: btn.id || ''
          })
        })

        document.querySelectorAll('button').forEach((btn, i) => {
          buttons.push({
            type: 'button',
            index: i,
            text: btn.textContent?.trim() || '',
            className: btn.className || '',
            id: btn.id || ''
          })
        })

        return buttons
      })

      console.log('All buttons found:', JSON.stringify(allButtons, null, 2))
    }

    // Validate dropdowns
    console.log('Looking for select elements...')
    const allSelects = await page.evaluate(() => {
      const selects = []

      document.querySelectorAll('select').forEach((select, i) => {
        const options = Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.textContent?.trim()
        }))

        selects.push({
          index: i,
          name: select.name || '',
          id: select.id || '',
          className: select.className || '',
          selectedValue: select.value,
          options
        })
      })

      return selects
    })

    console.log('All selects found:', JSON.stringify(allSelects, null, 2))

    // Look for drawing mode
    const drawModeSelect = allSelects.find(select =>
      select.options.some(opt => ['Grid', 'Circle', 'Grid2'].includes(opt.value))
    )

    console.log(`Drawing mode select found: ${!!drawModeSelect}`)
    if (drawModeSelect) {
      console.log('Drawing mode details:', JSON.stringify(drawModeSelect, null, 2))
    }

    console.log('GUI validation complete!')
  } catch (error) {
    console.error('Error during validation:', error)
  } finally {
    await browser.close()
  }
}

// Run the validation
validateGUI().catch(console.error)
