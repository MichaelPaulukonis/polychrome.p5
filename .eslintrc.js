module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'p5js'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'import/order': 'off'
  }
}
