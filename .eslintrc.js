module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'plugin:nuxt/recommended',
    'p5js',
    'standard'
    // ,'@nuxtjs'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'import/order': 'off'
  }
}
