# TypeScript Migration Plan

## 1. Overview

This document outlines a plan to incrementally introduce TypeScript into the PolychromeText project. The goal is to improve code quality, catch errors early, enhance developer experience with better autocompletion, and make the codebase more maintainable and scalable without disrupting ongoing development.

## 2. Prerequisites: TypeScript Setup

Before migrating any files, we need to add TypeScript support to the Nuxt 2 project.

### Step 2.1: Install Dependencies

Run the following command to install the necessary development dependencies:

```bash
npm install --save-dev typescript @nuxt/typescript-build @types/node
```

### Step 2.2: Create `tsconfig.json`

Create a `tsconfig.json` file in the project root. This file configures the TypeScript compiler. A good starting configuration is below. The `"paths"` alias for `~/*` is crucial for Nuxt's directory structure.

```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": [
      "esnext",
      "esnext.asynciterable",
      "dom"
    ],
    "esModuleInterop": true,
    "allowJs": true,
    "sourceMap": true,
    "strict": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "~/*": [
        "./*"
      ],
      "@/*": [
        "./*"
      ]
    },
    "types": [
      "@types/node",
      "@nuxt/types"
    ]
  },
  "exclude": [
    "node_modules",
    ".nuxt",
    "dist"
  ]
}
```

### Step 2.3: Update `nuxt.config.js`

Add the TypeScript build module to your `nuxt.config.js` file:

```javascript
export default {
  // ...
  buildModules: [
    '@nuxt/typescript-build',
    // ... other modules
  ],
  // ...
}
```

After these steps, you can start the dev server, and Nuxt will respect the new TypeScript configuration.

## 3. Migration Strategies

There are two primary strategies for migrating the codebase.

### Option 1: Incremental (Ad-Hoc) Migration (Recommended)

This approach involves converting JavaScript files to TypeScript one at a time, or one module at a time. This is the safest and most manageable strategy for an existing project.

#### Workflow:
1.  **Pick a File:** Start with a small, low-dependency file, ideally a utility module (e.g., a file in `src/utils/`).
2.  **Rename:** Rename the file from `.js` to `.ts`.
3.  **Add Types:** Open the new `.ts` file and begin adding types to function parameters, return values, and variables.
4.  **Run Type Checker:** The Nuxt dev server will automatically run the TypeScript compiler and show you errors in the console.
5.  **Fix Errors:** Address the type errors until the file compiles successfully. This might involve creating interfaces or types for complex objects.
6.  **Repeat:** Continue this process for other files, gradually increasing the typed coverage of the codebase.

#### Pros:
*   **Low Risk:** Changes are small, isolated, and easy to review and revert if necessary.
*   **No Blocked Development:** New features and bug fixes can be developed in parallel.
*   **Immediate Value:** You start benefiting from type safety in the converted parts of the codebase right away.
*   **Gradual Learning Curve:** Allows the team to learn and adapt to TypeScript at a comfortable pace.

#### Cons:
*   **Mixed Codebase:** For a period, the project will contain both `.js` and `.ts` files, which can require some mental context-switching.
*   **Incomplete Type Safety:** The full benefits of TypeScript are not realized until the entire application is migrated. Interactions between typed and untyped code can still lead to runtime errors.

### Option 2: All-at-Once Migration

This approach involves converting the entire codebase to TypeScript in a single, dedicated effort, typically on a separate branch.

#### Workflow:
1.  **Create a Branch:** Create a new `feature/typescript-migration` branch.
2.  **Rename All Files:** Run a script to rename all `.js` files within the `src/` directory to `.ts`.
3.  **Compile and List Errors:** Run `npx tsc --noEmit` to generate a complete list of all type errors across the project.
4.  **Fix All Errors:** Work through the entire codebase, adding types and fixing every error until the project compiles cleanly.
5.  **Merge:** Once all errors are resolved and the application runs correctly, merge the branch.

#### Pros:
*   **Codebase Consistency:** Results in a fully-typed, consistent codebase in one go.
*   **Comprehensive Type Coverage:** All interactions are type-checked, providing maximum safety.
*   **Clean Break:** Avoids the complexity of a mixed-language environment.

#### Cons:
*   **High Risk and Effort:** This is a massive, monolithic task that is difficult to estimate and can be very time-consuming.
*   **Blocks All Other Development:** To avoid massive merge conflicts, all other feature development must be frozen until the migration is complete.
*   **Overwhelming:** Can be extremely challenging, especially if the team is new to TypeScript.

## 4. Recommendation

For the PolychromeText project, the **Incremental (Ad-Hoc) Migration is strongly recommended.**

Given that this is a creative coding application with ongoing experimentation, a high-risk, all-or-nothing approach is not suitable. The incremental strategy provides immediate benefits with minimal disruption, allowing you to continue developing features while gradually improving the codebase's quality and safety.

## 5. Suggested First Steps

1.  Perform the setup steps outlined in **Section 2**.
2.  Choose a simple utility file from `src/utils/` to convert first. A good candidate would be `src/utils/apx.js` or another file with pure functions.
3.  Rename it to `.ts`, add the necessary types, and ensure the application still builds and runs correctly.
4.  From there, you can move on to more complex modules or begin writing all new features in TypeScript from the start.
