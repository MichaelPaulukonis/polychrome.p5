// tests/e2e/utils/canvas-utils.js

/**
 * Wait for p5.js instance to be fully initialized and ready
 * This is crucial for PolychromeText since the app depends on p5.js
 * PolychromeText stores the p5 instance in a Sketch class in the root Vue component
 */
export async function waitForP5Ready(page) {
  await page.waitForFunction(() => {
    // Check if there's a canvas element (p5 creates this)
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      return false
    }

    // Check if Vue component is mounted and has pchrome
    const app = document.querySelector('#app')
    if (!app || !app.__vue__) {
      return false
    }

    // pchrome is in the root Vue component, not a child
    const rootVue = app.__vue__
    return rootVue.$data && rootVue.$data.pchrome && rootVue.$data.pchrome.p5
  })
}

/**
 * Wait for basic canvas rendering to be ready
 */
export async function waitForCanvasRender(page) {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas')
    return canvas && canvas.width > 0 && canvas.height > 0
  })
}

/**
 * p5.js-specific drawing pattern for testing
 * Draws a simple test pattern on the canvas
 */
export async function drawTestPattern(page) {
  await waitForP5Ready(page)

  const canvas = page.locator('canvas').first()

  // Draw a simple test pattern
  await canvas.click({ position: { x: 50, y: 50 } })
  await canvas.click({ position: { x: 150, y: 50 } })
  await canvas.click({ position: { x: 100, y: 100 } })

  // Wait for p5.js to process the drawing
  await page.waitForTimeout(100)
}

/**
 * Get pixel data from canvas at specific coordinates
 * Useful for color verification tests
 */
export async function getCanvasPixelData(page, x, y) {
  return await page.evaluate((coords) => {
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(coords.x, coords.y, 1, 1)
    return Array.from(imageData.data)
  }, { x, y })
}

/**
 * Check if p5.js is in a specific drawing mode
 * Accesses PolychromeText's global parameters
 */
export async function getCurrentDrawingMode(page) {
  return await page.evaluate(() => {
    const app = document.querySelector('#app')
    if (!app || !app.__vue__) {
      return 'unknown'
    }
    const rootVue = app.__vue__
    return rootVue.$data?.pchrome?.params?.paintMode || 'unknown'
  })
}

/**
 * Trigger p5.js keyboard shortcuts
 * Many PolychromeText features are accessed via keyboard
 */
export async function triggerP5Shortcut(page, key) {
  await page.keyboard.press(key)
  // Wait for p5.js to process the shortcut
  await page.waitForTimeout(50)
}

/**
 * Wait for fonts to load (critical for text-based p5.js apps)
 * PolychromeText is heavily dependent on fonts
 */
export async function waitForFontsLoaded(page) {
  await page.waitForFunction(() => {
    return document.fonts.ready
  })
}

/**
 * Wait for Nuxt client-side hydration
 * Important for Vue/Nuxt apps
 */
export async function waitForNuxtReady(page) {
  await page.waitForFunction(() => {
    return window.$nuxt && window.$nuxt.$store
  })
}

/**
 * Access Vue component data via Nuxt
 * Useful for checking component state
 */
export async function getVueComponentData(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    return element?.__vue__?.$data || null
  }, selector)
}

/**
 * Setup console error tracking for a page
 * Call this before page.goto() to capture errors during page load
 */
export function setupConsoleErrorTracking(page) {
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * GUI Interaction Utilities for PolychromeText
 * These functions help interact with the QuickSettings GUI controls
 */

/**
 * Change drawing mode via GUI dropdown
 * @param {Page} page - Playwright page object
 * @param {string} mode - Drawing mode ('Grid', 'Circle', 'Grid2')
 */
export async function setDrawingMode(page, mode) {
  await waitForP5Ready(page)

  // Find the drawMode dropdown by looking for the dropdown that contains the mode options
  const dropdown = await page.locator('select').evaluateAll((selects) => {
    return selects.find(select => {
      const options = Array.from(select.options)
      return options.some(option => ['Grid', 'Circle', 'Grid2'].includes(option.value))
    })
  })

  if (dropdown) {
    await page.selectOption(dropdown, mode)
    await page.waitForTimeout(100) // Wait for p5.js to process the change
  } else {
    throw new Error(`Could not find drawMode dropdown`)
  }
}

/**
 * Change paint mode via GUI dropdown
 * @param {Page} page - Playwright page object
 * @param {string} mode - Paint mode ('Rainbow1', 'Black', 'solid', etc.)
 * @param {string} target - Target control ('fill' or 'outline')
 */
export async function setPaintMode(page, mode, target = 'fill') {
  await waitForP5Ready(page)

  // Find the appropriate paintMode dropdown
  const dropdown = await page.locator('select').evaluateAll((selects, targetType) => {
    return selects.find(select => {
      const options = Array.from(select.options)
      // Look for dropdowns with paint mode options
      const hasPaintModes = options.some(option =>
        ['Rainbow1', 'Rainbow2', 'Black', 'White', 'solid', 'lerp-scheme'].includes(option.value)
      )
      if (!hasPaintModes) {
        return false
      }

      // Try to identify if this is fill or outline based on nearby GUI elements
      const parent = select.closest('.qs_container')
      if (parent) {
        const title = parent.querySelector('.qs_title')
        if (title && targetType === 'fill') {
          return title.textContent.toLowerCase().includes('fill')
        } else if (title && targetType === 'outline') {
          return title.textContent.toLowerCase().includes('outline')
        }
      }

      // If we can't identify, assume the first match is fill
      return targetType === 'fill'
    })
  }, target)

  if (dropdown) {
    await page.selectOption(dropdown, mode)
    await page.waitForTimeout(100)
  } else {
    throw new Error(`Could not find ${target} paintMode dropdown`)
  }
}

/**
 * Adjust a parameter slider/input
 * @param {Page} page - Playwright page object
 * @param {string} parameter - Parameter name (e.g., 'rows', 'columns', 'textSize')
 * @param {number} value - New value
 */
export async function setParameter(page, parameter, value) {
  await waitForP5Ready(page)

  // Try to find the parameter input by looking for inputs near labels
  const input = await page.locator('input').evaluateAll((inputs, paramName) => {
    return inputs.find(input => {
      // Check if input is associated with a label containing the parameter name
      const parent = input.closest('.qs_container')
      if (parent) {
        const label = parent.querySelector('.qs_label')
        if (label && label.textContent.toLowerCase().includes(paramName.toLowerCase())) {
          return true
        }
      }

      // Check if input has an id or name that matches
      return input.id === paramName || input.name === paramName
    })
  }, parameter)

  if (input) {
    await input.fill(value.toString())
    await page.keyboard.press('Enter') // Trigger change event
    await page.waitForTimeout(100)
  } else {
    throw new Error(`Could not find parameter input for ${parameter}`)
  }
}

/**
 * Click a GUI button
 * @param {Page} page - Playwright page object
 * @param {string} buttonText - Button text (e.g., 'clear', 'save')
 */
export async function clickGuiButton(page, buttonText) {
  await waitForP5Ready(page)

  const button = page.locator('button').filter({ hasText: buttonText })
  await button.click()
  await page.waitForTimeout(100)
}

/**
 * Get current parameter value
 * @param {Page} page - Playwright page object
 * @param {string} parameter - Parameter name
 * @returns {Promise<any>} Current parameter value
 */
export async function getParameterValue(page, parameter) {
  return await page.evaluate((paramName) => {
    const app = document.querySelector('#app')
    if (!app || !app.__vue__) {
      return null
    }
    const rootVue = app.__vue__
    const params = rootVue.$data?.pchrome?.params
    if (!params) {
      return null
    }

    // Handle nested parameters (e.g., 'fill.paintMode')
    const path = paramName.split('.')
    let value = params
    for (const key of path) {
      value = value?.[key]
      if (value === undefined) {
        return null
      }
    }
    return value
  }, parameter)
}

/**
 * Verify canvas has content (not blank)
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if canvas has content
 */
export async function canvasHasContent(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      return false
    }

    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Check if any pixel is not fully transparent
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) { // Alpha channel
        return true
      }
    }
    return false
  })
}

/**
 * Clear the canvas using the GUI button
 * @param {Page} page - Playwright page object
 */
export async function clearCanvas(page) {
  await clickGuiButton(page, 'clear')
  await page.waitForTimeout(200) // Wait for clear to complete
}
