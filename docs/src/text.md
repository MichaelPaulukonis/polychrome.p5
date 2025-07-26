# Text Module

The `text` module is responsible for providing and managing the source text that is rendered on the canvas by the various drawing modes.

## Architecture

-   **`TextManager.js`**: The core of the module, a class that holds the source text and provides methods for accessing it in different ways.
-   **`corpus.js`**: A static data file containing a pre-defined collection of texts.
-   **`tumblr-random.js`**: A utility for fetching random text from a Tumblr blog.

---

## `TextManager` Class

The `TextManager` class is the central component for text handling.

### `constructor(text)`

The constructor takes an initial `text` string. If no text is provided, it uses a default string.

### Methods

-   **`setText(text)`**: Sets the internal source text. It also processes the text to create an array of words for the `getWord` method.
-   **`getText()`**: Returns the full, current source text string.
-   **`getchar()`**: Returns the next character from the source text in sequence, looping back to the beginning when it reaches the end.
-   **`getcharRandom()`**: Returns a single character chosen randomly from the source text.
-   **`getWord()`**: Returns the next word from the source text in sequence, looping back to the beginning when it reaches the end.

---

## Text Sources

### `corpus.js`

This file exports a single array named `texts`. This array contains several long strings of text from various sources, which can be loaded into the `TextManager` to provide a static, offline source of content.

### `tumblr-random.js`

This file exports a single default function, `tumblrRandomPost`.

-   **`tumblrRandomPost()`**: This function fetches a random post from the `poeticalbot.tumblr.com` blog using the Tumblr API. It uses the `axios` library to make the HTTP request and `cheerio` to parse the HTML from the post body and extract the text. It returns a Promise that resolves with an array of strings, where each string is the text content of a post. This provides a way to dynamically load new, random content into the application.
