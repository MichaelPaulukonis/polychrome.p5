// tests/e2e/smoke/debug-vue.spec.js
import { test, expect } from '@playwright/test'

test.describe('Debug Vue Structure', () => {
  test('explore Vue component structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000) // Wait for everything to load

    const vueStructure = await page.evaluate(() => {
      const app = document.querySelector('#app')
      if (!app || !app.__vue__) {
        return { error: 'No Vue instance found' }
      }

      const rootVue = app.__vue__
      const children = rootVue.$children || []

      const structure = {
        rootKeys: Object.keys(rootVue.$data || {}),
        childrenCount: children.length,
        children: children.map((child, index) => {
          const data = child.$data || {}
          const componentName = child.$options.name || child.$options._componentTag || 'unnamed'
          return {
            index,
            componentName,
            dataKeys: Object.keys(data),
            hasPchrome: !!data.pchrome,
            pchrome: data.pchrome ? {
              hasP5: !!data.pchrome.p5,
              keys: Object.keys(data.pchrome)
            } : null
          }
        })
      }

      return structure
    })

    console.log('Vue structure:', JSON.stringify(vueStructure, null, 2))

    expect(vueStructure.childrenCount).toBeGreaterThan(0)
  })
})
