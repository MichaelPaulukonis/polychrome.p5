import { defineNuxtConfig } from 'nuxt/config'
import { version } from './package.json'

// only add `router.base = '/<repository-name>/'` if `DEPLOY_ENV` is `GH_PAGES`
const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? '/polychrome.p5/' : ''

export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      appVersion: version
    }
  },
  app: {
    baseURL: routerBase,
    head: {
      title: process.env.npm_package_name || '',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: `${routerBase.replace(/\/$/, '')}/favicon.ico` }
      ]
    }
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/css/main.scss',
    '@/assets/css/core.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/setFocus', mode: 'client' }
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts'
  ],

  fonts: {
    families: [
      { name: 'Graphik', src: `${routerBase}/fonts/fonts.css` },
      { name: 'Tiempos Headline', src: `${routerBase}/fonts/fonts.css` }
    ]
  },
})
