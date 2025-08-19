# Text Module

The `text` module is responsible for providing and managing the source text that is rendered on the canvas by the various drawing modes.

## Architecture

-   **`TextManager.js`**: The core of the module, a class that holds the source text and provides methods for accessing and manipulating it. It can be initialized with a text string, or it will use a default string.

---

## `TextManager` Class

The `TextManager` class is the central component for text handling.

### `constructor(text)`

The constructor takes an initial `text` string. If no text is provided, it uses a default string: `'These are the pearls that were his eyes'`.

### Methods

-   **`setText(text)`**: Sets the internal source text. It also processes the text to create an array of words for the `getWord` method.
-   **`getText()`**: Returns the full, current source text string.
-   **`getchar()`**: Returns the next character from the source text in sequence, looping back to the beginning when it reaches the end.
-   **`getcharRandom()`**: Returns a single character chosen randomly from the source text.
-   **`getWord()`**: Returns the next word from the source text in sequence, looping back to the beginning when it reaches the end.