# Fit Text Utility

The `fit.text.js` module provides a utility function to calculate the optimal font size to make a given string of text fit within a specified width on the canvas.

---

## `fitTextOnCanvas(text, fontface, fitwidth, layer)`

This is the main function exported by the module. It determines the largest font size at which the given `text` will not exceed the `fitwidth`.

**Parameters:**

-   `text` (string): The text to be measured.
-   `fontface` (string): The name of the font to use for the measurement.
-   `fitwidth` (number): The target width in pixels that the text should fit within.
-   `layer` (`p5.Graphics`): The graphics layer to use for the text measurement, as it holds the `textFont` and `textWidth` methods.

**Returns:** (number) The calculated font size.

**Usage:**

This function is used by the `rowcol-painter` to ensure that the text rendered in each cell of the grid does not overflow the cell's boundaries.

---

## `measureTextBinaryMethod(...)`

This is a recursive helper function that implements a binary search algorithm to efficiently find the correct font size. It repeatedly measures the text at the midpoint of a min/max font size range, narrowing the search space by half in each step until it converges on the optimal size. This is much more performant than iterating through font sizes one by one.
