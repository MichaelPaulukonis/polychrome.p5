// test/e2e/debug/inspect-gui-structure.spec.js

import { test, expect } from '@playwright/test'
import { waitForP5Ready, waitForFontsLoaded } from '../utils/canvas-utils.js'

test.describe('GUI Structure Investigation', () => {
  test('inspect QuickSettings DOM structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)

    // Wait a bit for GUI to fully render
    await page.waitForTimeout(1000)

    // Get all the DOM structure information we need
    const guiInfo = await page.evaluate(() => {
      const results = {
        allButtons: [],
        allInputs: [],
        allSelects: [],
        quickSettingsElements: [],
        allElementsWithText: [],
        bodyClasses: document.body.className,
        allDivs: []
      }

      // Find all buttons
      const buttons = document.querySelectorAll('button')
      buttons.forEach((btn, index) => {
        results.allButtons.push({
          index,
          text: btn.textContent?.trim() || '',
          id: btn.id || '',
          className: btn.className || '',
          visible: btn.offsetParent !== null,
          disabled: btn.disabled
        })
      })

      // Find all inputs
      const inputs = document.querySelectorAll('input')
      inputs.forEach((input, index) => {
        results.allInputs.push({
          index,
          type: input.type,
          name: input.name || '',
          id: input.id || '',
          className: input.className || '',
          value: input.value || '',
          placeholder: input.placeholder || '',
          visible: input.offsetParent !== null
        })
      })

      // Find all selects
      const selects = document.querySelectorAll('select')
      selects.forEach((select, index) => {
        results.allSelects.push({
          index,
          name: select.name || '',
          id: select.id || '',
          className: select.className || '',
          selectedValue: select.value || '',
          visible: select.offsetParent !== null
        })
      })

      // Look for QuickSettings specific elements
      const quickSettingsContainers = document.querySelectorAll('div[class*="quicksettings"], div[id*="quicksettings"], .qs_container, .qs_main')
      quickSettingsContainers.forEach((el, index) => {
        results.quickSettingsElements.push({
          index,
          tagName: el.tagName,
          className: el.className || '',
          id: el.id || '',
          innerHTML: el.innerHTML.substring(0, 200) + '...' // Truncate for readability
        })
      })

      // Find elements containing specific text we're looking for
      const textSearchTerms = ['clear', 'Grid', 'Circle', 'Black', 'rows', 'columns']
      textSearchTerms.forEach(term => {
        const xpath = `//*[contains(text(), '${term}')]`
        const elements = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
        for (let i = 0; i < elements.snapshotLength; i++) {
          const el = elements.snapshotItem(i)
          results.allElementsWithText.push({
            searchTerm: term,
            tagName: el.tagName,
            text: el.textContent?.trim() || '',
            className: el.className || '',
            id: el.id || '',
            visible: el.offsetParent !== null
          })
        }
      })

      // Get info about divs that might contain controls
      const divs = document.querySelectorAll('div')
      divs.forEach((div, index) => {
        if (div.className && (div.className.includes('qs') || div.className.includes('gui') || div.className.includes('control'))) {
          results.allDivs.push({
            index,
            className: div.className,
            id: div.id || '',
            textContent: div.textContent?.trim().substring(0, 100) || '',
            visible: div.offsetParent !== null
          })
        }
      })

      return results
    })

    console.log('=== GUI STRUCTURE INVESTIGATION ===')
    console.log('Body classes:', guiInfo.bodyClasses)
    console.log('\n=== ALL BUTTONS ===')
    guiInfo.allButtons.forEach(btn => {
      console.log(`Button ${btn.index}: "${btn.text}" (id: ${btn.id}, class: ${btn.className}, visible: ${btn.visible})`)
    })

    console.log('\n=== ALL INPUTS ===')
    guiInfo.allInputs.forEach(input => {
      console.log(`Input ${input.index}: type=${input.type}, name=${input.name}, value=${input.value}, visible=${input.visible}`)
    })

    console.log('\n=== ALL SELECTS ===')
    guiInfo.allSelects.forEach(select => {
      console.log(`Select ${select.index}: name=${select.name}, value=${select.selectedValue}, visible=${select.visible}`)
    })

    console.log('\n=== QUICKSETTINGS ELEMENTS ===')
    guiInfo.quickSettingsElements.forEach(el => {
      console.log(`QS Element ${el.index}: ${el.tagName} (class: ${el.className}, id: ${el.id})`)
    })

    console.log('\n=== ELEMENTS WITH SPECIFIC TEXT ===')
    guiInfo.allElementsWithText.forEach(el => {
      console.log(`"${el.searchTerm}" found in: ${el.tagName} "${el.text}" (class: ${el.className}, visible: ${el.visible})`)
    })

    console.log('\n=== RELEVANT DIVS ===')
    guiInfo.allDivs.forEach(div => {
      console.log(`Div ${div.index}: class="${div.className}", content: "${div.textContent}"`)
    })

    // Take a screenshot for visual reference
    await page.screenshot({ path: 'test-results/gui-structure-debug.png', fullPage: true })

    // This test always passes - it's just for investigation
    expect(true).toBe(true)
  })

  test('test specific clear button approaches', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await waitForFontsLoaded(page)
    await waitForP5Ready(page)
    await page.waitForTimeout(1000)

    // Try different approaches to find the clear button
    const clearButtonTests = await page.evaluate(() => {
      const results = []

      // Test 1: Look for button with text 'clear'
      const clearBtn1 = document.querySelector('button:has-text("clear")')
      results.push({ method: 'button:has-text("clear")', found: !!clearBtn1 })

      // Test 2: Look for any element with text 'clear'
      const clearElements = document.querySelectorAll('*')
      let clearFound = false
      for (const el of clearElements) {
        if (el.textContent && el.textContent.toLowerCase().includes('clear')) {
          clearFound = true
          results.push({
            method: 'text search',
            found: true,
            element: el.tagName,
            text: el.textContent.trim(),
            className: el.className
          })
          break
        }
      }
      if (!clearFound) {
        results.push({ method: 'text search', found: false })
      }

      // Test 3: Look for pchrome.clearCanvas function
      const app = document.querySelector('#app')
      if (app && app.__vue__) {
        const pchrome = app.__vue__.$data.pchrome
        results.push({
          method: 'pchrome.clearCanvas',
          found: typeof pchrome.clearCanvas === 'function',
          type: typeof pchrome.clearCanvas
        })
      }

      return results
    })

    console.log('\n=== CLEAR BUTTON INVESTIGATION ===')
    clearButtonTests.forEach(test => {
      console.log(`${test.method}: ${test.found ? 'FOUND' : 'NOT FOUND'}`, test.element ? `(${test.element}: "${test.text}")` : '')
    })

    expect(true).toBe(true)
  })
})
