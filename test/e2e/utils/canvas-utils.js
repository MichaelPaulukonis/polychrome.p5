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

// Expand all collapsed GUI panels
export async function expandAllGuiPanels(page) {
  await page.evaluate(() => {
    const panels = document.querySelectorAll('.qs_main')
    panels.forEach(panel => {
      if (!panel.querySelector('.qs_content')) {
        panel.querySelector('.qs_title_bar').dispatchEvent(new MouseEvent("dblclick"))
      }
    })
  })
}

// collapse all expanded GUI panels
export async function collapseAllGuiPanels(page) {
  await page.evaluate(() => {
    const panels = document.querySelectorAll('.qs_main')
    panels.forEach(panel => {
      if (panel.querySelector('.qs_content')) {
        panel.querySelector('.qs_title_bar').dispatchEvent(new MouseEvent("dblclick"))
      }
    })
  })
}

export async function expandTargetGuiPanel(page, panelTitle) {
  // collapse all by default
  await collapseAllGuiPanels(page)

  // Locate the specific panel by its title text.
  const panel = page.locator(`.qs_main:has(.qs_title_bar:has-text("${panelTitle}"))`);

  // A panel is collapsed if it does not have a .qs_content element.
  const isCollapsed = (await panel.locator('.qs_content').count()) === 0;

  if (isCollapsed) {
    // Find the title bar within that specific panel and double-click it.
    const titleBar = panel.locator('.qs_title_bar');
    await titleBar.dblclick({ force: true }); // Use force to avoid pointer event issues.
    // Wait for the content to appear, confirming the panel is expanded.
    await panel.locator('.qs_content').waitFor({ state: 'visible', timeout: 5000 });
  }
}

export async function getCanvasData(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas#defaultCanvas0');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  });
}

/**
 * p5.js-specific drawing pattern for testing
 * Draws a simple test pattern on the canvas
 */
export async function drawTestPattern(page) {
  await waitForP5Ready(page)

  // TODO: this is generally correct, but c ould be more specific. there's a better selector
  // const canvas = document.querySelector('canvas#defaultCanvas0');
  const canvas = page.locator('canvas').first()

  // Draw a simple test pattern
  // TODO: use simulatePaintGesture
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
    return window.$nuxt
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
 * QuickSettings creates: bindDropDown('drawMode', drawModes, params)
 * drawModes = ['Grid', 'Circle', 'Grid2']
 */
export async function setDrawingMode(page, mode) {
  await waitForQuickSettingsReady(page);
  await expandTargetGuiPanel(page, 'PolychromeText');

  // Locate the specific container for the "drawMode" control and then the select element within it.
  const drawModeSelect = page.locator('.qs_container:has-text("drawMode") select');

  await drawModeSelect.selectOption({ label: mode });
  await page.waitForTimeout(100);
}

/**
 * Change paint mode via GUI dropdown
 * @param {Page} page - Playwright page object
 * @param {string} mode - Paint mode ('Rainbow1', 'Black', 'solid', etc.)
 * @param {string} target - Target control ('fill' or 'outline')
 */
export async function setPaintMode(page, mode, target = 'Fill') {
  await waitForP5Ready(page)

  await expandTargetGuiPanel(page, target);

  // Locate the panel that contains the title.
  const panel = page.locator(`.qs_main:has(.qs_title_bar:has-text("${target}"))`);

  // Within that panel, find the select element for paintMode.
  const paintModeSelect = panel.locator('.qs_container:has(.qs_label:has-text("paintMode")) select');

  // Now, select the option on the located element.
  await paintModeSelect.selectOption(mode);
  await page.waitForTimeout(100);
}

/**
 * Adjust a parameter slider/input
 * @param {Page} page - Playwright page object
 * @param {string} parameter - Parameter name (e.g., 'rows', 'columns', 'textSize')
 * @param {number} value - New value
 */
export async function setParameter(page, parameter, value) {
  await waitForP5Ready(page);

  const success = await page.evaluate(({ paramName, newValue }) => {
    const inputs = Array.from(document.querySelectorAll('.qs_main input'));
    const input = inputs.find(inp => {
      const parent = inp.closest('.qs_container');
      if (parent) {
        const label = parent.querySelector('.qs_label');
        if (label && label.textContent.toLowerCase().includes(paramName.toLowerCase())) {
          return true;
        }
      }
      return inp.id === paramName || inp.name === paramName;
    });

    if (input) {
      input.value = newValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }, { paramName: parameter, newValue: value });

  if (!success) {
    throw new Error(`Could not find parameter input for ${parameter}`);
  }

  await page.waitForTimeout(100);
}

/**
 * Click a QuickSettings button
 * QuickSettings buttons are input[type="button"] elements with class "qs_button"
 */
export async function clickGuiButton(page, buttonText) {
  await waitForP5Ready(page)

  const button = page.locator(`input[type="button"][value="${buttonText}"].qs_button`)
  await button.click({ force: true });
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
export async function canvasHasContent(page, initialImageData) {
  const currentImageData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas#defaultCanvas0');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  });

  if (!currentImageData) return false;

  // If no initial image data is provided, check for a non-monochromatic image.
  if (!initialImageData) {
    const firstPixelR = currentImageData[0];
    const firstPixelG = currentImageData[1];
    const firstPixelB = currentImageData[2];

    for (let i = 4; i < currentImageData.length; i += 4) {
      if (
        currentImageData[i] !== firstPixelR ||
        currentImageData[i + 1] !== firstPixelG ||
        currentImageData[i + 2] !== firstPixelB
      ) {
        // Found a pixel with a different color, so there is content.
        return true;
      }
    }
    // All pixels are the same color, so there is no content.
    return false;
  }

  // Compare current image data to the initial snapshot.
  if (currentImageData.length !== initialImageData.length) return true; // Different sizes means canvas size has changed.

  for (let i = 0; i < currentImageData.length; i++) {
    if (currentImageData[i] !== initialImageData[i]) {
      return true; // Pixel data has changed.
    }
  }

  return false; // No change from initial state.
}

/**
 * Clear the canvas using the GUI button
 * Updated based on actual DOM structure validation
 */
export async function clearCanvas(page) {
  await waitForQuickSettingsReady(page);
  await expandTargetGuiPanel(page, 'PolychromeText')

  // This locator is now specific to the clear button within a QS panel.
  const clearButton = page.locator('.qs_main input.qs_button[value="clear"]');
  // Force the click to bypass Playwright's actionability checks, which is
  // necessary when another element is intercepting pointer events.
  await clearButton.click({ force: true });

  await page.waitForTimeout(200);
}

/**
 * Wait for QuickSettings GUI to be fully initialized
 * This is crucial because GUI panels are created after p5 setup
 */
export async function waitForQuickSettingsReady(page) {
  await page.waitForFunction(() => !!window.quicksettings_loaded, null, { timeout: 30000 })
  // Give a moment for all panels to fully render after the flag is set
  await page.waitForTimeout(1000)
}

export async function basicSetup(page) {
  await page.getByRole('button', { name: 'textManager' }).click();
  await page.locator('#bodycopy').click();
  await page.locator('#bodycopy').press('ControlOrMeta+a');
  await page.locator('#bodycopy').fill('This is the text we are looking for.');
  await page.getByRole('button', { name: 'Apply text' }).click();
  await page.getByRole('button', { name: 'Apply text' }).press('Escape');

  await page.getByText('PolychromeText').click();
  await page.locator('#qs_1').click();
  await page.locator('#qs_1').press('ControlOrMeta+a');
  await page.locator('#qs_1').fill('400');
  await page.locator('#qs_1').press('Tab');
  await page.locator('#qs_2').fill('400');
  await page.locator('#qs_2').press('Tab');
  await page.getByRole('button', { name: 'clear' }).click()
}

/**
 * Simulates one or more painting gestures on a canvas.
 *
 * @param canvas Playwright Locator pointing to a canvas element
 * @param paths Array of stroke paths. Each path is an array of {x, y} points relative to the canvas.
 * @param options Optional: { steps } for interpolation smoothness between points
 */
export async function simulatePaintGesture(
  canvas,
  page,
  paths,
  options,
) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found or not visible');
  const steps = options?.steps ?? 10;

  for (const path of paths) {
    if (path.length === 0) continue;

    // Offset path to absolute screen coordinates
    const absPath = path.map(p => ({
      x: box.x + p.x,
      y: box.y + p.y,
    }));

    // Move to first point and press mouse down
    await canvas.page().mouse.move(absPath[0].x, absPath[0].y);
    await canvas.page().mouse.down();

    // Move through rest of the points with interpolation
    for (let i = 1; i < absPath.length; i++) {
      const from = absPath[i - 1];
      const to = absPath[i];

      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        // console.log(`Moving to (${x}, ${y})`);
        await canvas.page().mouse.move(x, y);
        await page.waitForTimeout(50)
      }
    }

    await canvas.page().mouse.up();
  }
}


