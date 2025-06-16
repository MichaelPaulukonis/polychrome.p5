# GitHub Copilot Instructions for PolychromeText

## Project Context

This is a Nuxt.js 3 application designed to help job seekers compare their resumes against job postings. The tool analyzes job descriptions to identify skill matches, gaps, and provide tailored suggestions for improving application materials.

## Technology Stack

When suggesting code, please use the following technologies:

- **Nuxt.js 2** WIP upgrade to Nuxt 3
  - dependent upon vue-js-modal which needs modification for Nuxt 3
- **TypeScript** prefer for all code files, with proper typing
  - Has not yet been implemented
- **CSS** for styling components
  - undocumented state, partially outdated with many warning
- **Nuxt Router** for navigation
- **Nuxt Reactive state** for state management
- No Vuex or Pinia required

## Storage

The application uses client-side local-storage for settings

This should be disclosed in the documentation

## Core Features & Implementation Guidelines


### UI Components

TODO:

## Code Style

Follow these coding style guidelines for consistency and quality:

- Use Nuxt 3's script setup syntax when possible
- Properly type all function parameters and return values
- Follow component composition pattern with reusable composables
- Write clear comments for complex logic
- Use semantic naming for variables and functions

Always utilize the latest JavaScript and TypeScript features in strict mode. Prefer semantic HTML elements over generic divs and ensure compliance with W3C standards and WCAG 2.1 AA guidelines. For CSS, use TailwindCSS with responsive designs based on Flexbox/Grid.

## Commit Message Guidelines

All commit messages should adhere to the Conventional Commits specification.
For detailed instructions, please refer to [Conventional Commits 1.0.0](./copilot-commit-message-instructions.md).

## Patterns and Best Practices

Apply functional programming principles and appropriate state management approaches:

NOTE: the below may only apply after the Nuxt 3 upgrade has been completed.

- Use `ref()` and `reactive()` for local component state
- Leverage Nuxt's `useState()` composable for shared state across components
- Implement `provide()`/`inject()` for passing data down component trees
- Use `useAsyncData()` and `useFetch()` for server data and API interactions

Implement code splitting with Nuxt's built-in lazy-loading:

- Lazy-loaded components with `defineAsyncComponent()`
- Lazy-loaded pages with the `lazy` option in route configuration

Extract and reuse common logic with Vue composables. For backend APIs, consistently validate and sanitize user inputs with libraries like Zod, Yup, or Joi.

## Folder Structure Guidelines

Follow Nuxt 3 conventions for directory organization with these specific structures:

### Core Directories

Organize standard Nuxt directories as follows:

TODO:

### Project-Specific Directories

Add these project-specific directories for better organization:

TODO:

Ensure consistent relative imports, using `~/` alias for project root. Keep related files close to where they're used when possible.

## Testing and Quality Considerations

Implement comprehensive testing with these approaches:

- Focus on unit testing for services and utility functions
- Component testing for key UI elements
- Mock external services appropriately

Write unit tests with Jest/Vitest for important functions and composables. Use @testing-library/vue for component tests, focusing on user behavior simulation. Implement integration tests for critical workflows and maintain a test coverage of at least 80% for critical business logic.

## Security

TODO: none of these may be appropriate for this application, please review

Apply OWASP Top 10 protections in all application components:

- Validate and sanitize all user inputs on both client and server sides
- For authentication, use JWT tokens with rotation and secure storage
- Apply the principle of least privilege for authorizations
- Avoid exposing sensitive information in logs or error messages
- Use secure practices for secret management (environment variables, secret managers)
- Implement CSP and other security headers to prevent XSS and CSRF attacks
