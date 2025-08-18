import { defineNuxtModule, addVitePlugin } from '@nuxt/kit'
import { fileURLToPath } from 'url'
import { resolve } from 'pathe'
import fs from 'fs'

export default defineNuxtModule({
  setup (options, nuxt) {
    const fontsDir = resolve(nuxt.options.rootDir, 'public/fonts/fonts')

    // Add a Vite plugin to create a virtual module
    addVitePlugin({
      name: 'font-loader',
      resolveId (id) {
        if (id === 'virtual:font-names') {
          return id
        }
      },
      load (id) {
        if (id === 'virtual:font-names') {
          try {
            const files = fs.readdirSync(fontsDir)
            const fontNames = files
              .filter(file => file.endsWith('.ttf'))
              .map(file => file.replace(/\.ttf$/, ''))
            return `export const fontNames = ${JSON.stringify(fontNames)}`
          } catch (e) {
            console.error('Error reading fonts directory:', e)
            return 'export const fontNames = []'
          }
        }
      }
    })
  }
})