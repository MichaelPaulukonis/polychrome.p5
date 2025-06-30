// Simple test to verify Playwright is working
import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('load')
  const title = await page.title()
  console.log('Page title:', title)
  expect(title).toContain('Polychrome')
})
