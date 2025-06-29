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
