// only add `router.base = '/<repository-name>/'` if `DEPLOY_ENV` is `GH_PAGES`
const routerBase = {
  router: {
    base: process.env.DEPLOY_ENV === 'GH_PAGES' ? '/polychrome.p5/' : ''
  }
}

export default {
  ...routerBase,
  ssr: false,
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
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
    { src: '~plugins/vue-js-modal', mode: 'client' },
    { src: '~/plugins/setFocus', mode: 'client' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    'nuxt-webfontloader'
  ],

  styleResources: {
    scss: [
      '@/assets/css/utilities/_variables.scss',
      '@/assets/css/utilities/_helpers.scss',
      '@/assets/css/base/_grid.scss',
      '@/assets/css/base/_buttons.scss'
    ]
  },

  webfontloader: {
    custom: {
      families: ['Graphik', 'Tiempos Headline'],
      urls: ['/fonts/fonts.css']
    }
  },

  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      })

      // Fix for cheerio ES modules
      config.resolve.alias = {
        ...config.resolve.alias,
        cheerio: 'cheerio/lib/cheerio.js'
      }

      // Use unminified p5.js in development
      if (ctx.isDev) {
        config.resolve.alias.p5 = 'p5/lib/p5.js'
        // If you also use p5.sound, you might want to alias it too:
        // config.resolve.alias['p5.sound'] = 'p5/lib/addons/p5.sound.js';
      }
    },
    // Transpile vue-js-modal
    transpile: ['vue-js-modal']
  }
}
