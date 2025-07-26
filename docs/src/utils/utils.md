# Utilities Module

The `utils` module provides general-purpose, higher-order utility functions that are used throughout the application to simplify common patterns.

---

## `apx(...fns)`

The `apx` function (short for "apply") is a higher-order function that allows you to apply one or more functions to each item in a list or generator.

**Signature:** `apx(...fns)(list)`

**Parameters:**

-   `...fns`: A variable number of functions to be applied.
-   `list`: An array or a generator that yields items.

**Returns:** A new array containing the results of the original list (it's used for its side effects).

**Usage:**

It's primarily used in the drawing modes to apply the `fill`, `outline`, and `paint` functions to each coordinate block yielded by a generator, without needing to write an explicit loop.

```javascript
// Example from grid-painter.js
apx(fill, outline, paint)(blocGen)
```

---

## `pushpop(layer)`

The `pushpop` function is a higher-order function that wraps another function within a `layer.push()` and `layer.pop()` call.

**Signature:** `pushpop(layer)(f)`

**Parameters:**

-   `layer`: The p5.js graphics layer object that has `push` and `pop` methods.
-   `f`: The function to be wrapped.

**Returns:** A new function that, when called, will execute the original function `f` within a `push`/`pop` context.

**Usage:**

This utility ensures that any transformations (like `translate`, `rotate`, `scale`) applied within the function `f` are localized and do not affect subsequent drawing operations, as the graphics state is automatically restored by `layer.pop()`. It's used extensively to keep drawing operations modular and predictable.
