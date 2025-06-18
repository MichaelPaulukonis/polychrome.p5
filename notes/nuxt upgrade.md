# Nuxt2 to Nuxt3 upgrade

MY MAJOR PROBLEM: vue-js-modal is not (natively) compatible with Nuxt3.
There are fixes or forks available.

There are some notes in Trello, but this is more comprehensive.

See: https://github.com/euvl/vue-js-modal/issues/814

## Framework Patterns (Nuxt 3)

=== NUXT 3 ONLY ===
NOTE: the below may only apply after the Nuxt 3 upgrade has been completed.

- Use Nuxt 3's script setup syntax when possible
- Use `ref()` and `reactive()` for local component state
- Leverage Nuxt's `useState()` composable for shared state across components
- Implement `provide()`/`inject()` for passing data down component trees
- Use `useAsyncData()` and `useFetch()` for server data and API interactions

Implement code splitting with Nuxt's built-in lazy-loading:

- Lazy-loaded components with `defineAsyncComponent()`
- Lazy-loaded pages with the `lazy` option in route configuration

Extract and reuse common logic with Vue composables. For backend APIs, consistently validate and sanitize user inputs with libraries like Zod, Yup, or Joi.

=== END NUXT 3 ONLY ===



## a generated plan

Upgrading from Nuxt 2 to Nuxt 3
Upgrading from Nuxt 2 to Nuxt 3 involves several steps, as there are significant changes between the two versions. Here is a step-by-step guide to help you with the upgrade process:

Step 1: Update package.json
Update the Nuxt dependency in your package.json file to the latest Nuxt 3 version:

Step 2: Install the updated dependencies
Run the following command in your terminal to install the updated dependencies:

Step 3: Update Configuration Files
Nuxt 3 uses a different configuration file format. Rename nuxt.config.js to nuxt.config.ts and update its content. Here is an example of a basic Nuxt 3 configuration:

Step 4: Update Project Structure
Nuxt 3 has a different project structure. You may need to move and rename some files and directories. Refer to the Nuxt 3 documentation for the updated structure.

Step 5: Update Code
Nuxt 3 introduces several breaking changes. You will need to update your code to be compatible with Nuxt 3. Some common changes include:

Replacing context with useNuxtApp or useRuntimeConfig
Updating middleware and plugins to the new format
Using the new defineNuxtConfig function in nuxt.config.ts
Refer to the Nuxt 3 migration guide for detailed instructions on updating your code.

Step 6: Test Your Application
After making the necessary changes, run your application to ensure everything works as expected:

Example package.json after update
Here is an example of what your package.json might look like after updating to Nuxt 3:

By following these steps, you should be able to upgrade your Nuxt 2 application to Nuxt 3. Make sure to refer to the official Nuxt 3 documentation for more detailed information and guidance.
