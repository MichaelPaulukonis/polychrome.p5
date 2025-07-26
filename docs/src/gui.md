# GUI Module

The `gui` module is responsible for creating and managing the user interface for PolychromeText. It uses a modified version of the `quicksettings.js` library to create interactive control panels.

## Architecture

The module is composed of several files, each handling a specific aspect of the GUI:

-   **`gui.js`**: The core of the module, responsible for creating and laying out the main GUI panels.
-   **`quicksettings.js`**: A third-party library that provides the underlying framework for the GUI panels.
-   **`actions.js`**: Defines a set of actions that can be triggered randomly during "auto-paint" mode.
-   **`keys.js`**: Sets up all the keyboard shortcuts (hotkeys) for the application.
-   **`macros.js`**: Defines a collection of complex, pre-programmed drawing operations.
-   **`gui.color.control.js`**: Contains utility functions specifically for the color-related GUI controls.
-   **`lerplist.js`**: A simple data file containing a list of pre-defined color schemes.

---

## Core GUI Setup (`gui.js`)

### `setupGui({ p5, sketch, params, ... })`

This is the main function that initializes the entire user interface. It creates several `QuickSettings` panels:

-   **PolychromeText (Main)**: Controls for global parameters like canvas dimensions, `drawMode`, `autoPaint`, etc.
-   **Font**: Controls for font selection, rotation, and character mode.
-   **Shadow**: Controls for text shadow properties.
-   **Fill**: Controls for the fill color, including paint mode, transparency, and color schemes.
-   **Outline**: Controls for the stroke/outline color and properties.
-   **SettingsArchive**: A panel for saving, loading, and updating presets of all the GUI settings to/from local storage.

This function also sets up the logic for dynamically showing and hiding controls based on the selected paint mode (e.g., showing the color palette controls only when a `lerp-quad` mode is active).

---

## Actions (`actions.js`)

### `setupActions(pct)`

This function returns an array of "action" objects. Each object contains a function that performs a specific operation, such as clearing the canvas, flipping the image, shifting colors, or applying a random layer. These actions are designed to be called randomly from the `autoDraw` function in `sketch.js` to create generative art.

---

## Hotkeys (`keys.js`)

### `setupHotkeys(pct)`

This function uses the `hotkeys-js` library to bind keyboard shortcuts to a wide range of application functions. This allows for keyboard-based control over most of the app's features, including:

-   Canvas transformations (flipping, shifting, rotating).
-   Changing drawing modes.
-   Toggling parameters (e.g., `useOutline`).
-   Triggering undo/redo.
-   Executing macros.

---

## Macros (`macros.js`)

### `Macros(pchrome)`

This is a factory function that returns an object containing a collection of "macros". A macro is a pre-defined sequence of drawing commands that creates a complex visual effect. Examples include `fiveCircles`, `manyGrids`, and `doubleMirror`.

Macros are wrapped in a `macroWrapper` function that automatically handles taking an undo snapshot and recording the macro action for the scripting system. They can be triggered via the hotkeys defined in `keys.js`.

---

## GUI Utilities

-   **`gui.color.control.js`**: Provides helper functions like `hexStringToColors` to parse color scheme strings and `gradient` to create CSS gradients for the UI.
-   **`lerplist.js`**: Exports an array of strings, where each string represents a color palette (e.g., `'ffffff-000000'`). This is used to populate the "multi-color" dropdown for the `lerp-scheme` paint mode.
