# File Library

The `filelib.js` module provides utility functions for generating formatted strings to be used in filenames, particularly for saving canvas images and animations.

---

## `datestring()`

This function returns a string representing the current date and time.

-   **Format:** `YYYYMMDDHHMMSS`
-   **Example:** `20231027103000`
-   **Usage:** It's used to create a unique, timestamped prefix for a series of saved files.

---

## `filenamer(prefix)`

This is a factory function that returns a specialized naming function.

-   **Argument:** `prefix` (string) - Typically, this is the timestamp generated by `datestring()`.
-   **Returns:** A new function.

### The Returned Naming Function

Each time the returned function is called, it generates a new filename string that includes the original prefix and an incrementing, zero-padded frame number.

-   **Format:** `polychrometext.[prefix]-[frame_number]`
-   **Example:**
    -   First call: `polychrometext.20231027103000-000000`
    -   Second call: `polychrometext.20231027103000-000001`
-   **Usage:** This is used by the `savit()` function in `sketch.js` to generate sequential filenames when capturing animation frames.
