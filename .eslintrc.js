module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'p5js',
    'standard'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'import/order': 'off'
  }
}
