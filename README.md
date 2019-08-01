# Polychrome Text - p5.js version
Online @ https://michaelpaulukonis.github.io/polychrome.p5/

## Poly-WHAT???
Polychrome - or many colors.

Traditionally, text and image are segregated in Western Art.

This web-app plays with those boundaries, providing an polychromatic text painting environment.

> Although the word polychrome is created from the combining of two Greek words, it was not used in ancient Greece. The term was coined in the early nineteenth century by Antoine Chrysostôme Quatremère de Quincy. ([source](https://en.wikipedia.org/wiki/Ancient_Greek_art#Polychromy))


## Previous version
Conversion of my Processing.js text-app from [WebText sketches](https://github.com/MichaelPaulukonis/WebText)

Previous version online @ http://www.xradiograph.com/netart/024.html

## Dev notes
THIS IS A HORRIBLE MISH-MASH of procedural code, wannabe-functional-light code, and un-planned cowboy coding
GUI and core function are intermingled (although less so than originally)

## makes use of
 - [dat.gui](https://github.com/dataarts/dat.gui)
  - [tutorial](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage)

## Colors
Working with colors may be a cheap distraction, but I think it's important (even moreso than fonts and content?!!!).

 - https://p5js.org/reference/#group-Color
 - [lerpColor](https://p5js.org/examples/color-linear-gradient.html)
  - https://p5js.org/reference/#/p5/lerpColor
  - https://p5js.org/reference/#/p5/lerp
 - http://paletton.com
 - https://coolors.co/
 - http://colormind.io/
 - https://htmlcolorcodes.com/resources/best-color-palette-generators/
 - https://color.adobe.com/create/color-wheel/
 - https://p5js.org/learn/color.html
 - https://p5js.org/examples/color-color-variables.html


## kaliedoscope
This is a fun variation, but might be going a bit afield of the purpose.
https://github.com/rbyte/Kaleidoscope
https://github.com/coldhead/kaleidos

## automation
I'm looking in automation via puppeteer.
It's a thought.

## Macros
They're not recordings of actions (although that was the original idea). They're preprogrammed actions.
They are evolving, which is good.

## Recursion/sub-grids
Instead of painting entire screen, paint repeating tiles - which is the thing the grid painter is doing already, on a letter-by-letter level.

So, who knows.

Would be nice to have the circles centered anywhere - larger, smaller, etc.

Everything is flat. No shadows, no dimensions, no pretend angles.

But.... someday? Who knows.

## UI
https://github.com/bit101/quicksettings => the raw, unwrapped version looks like it should work better than the p5 gui wrapper
The "wrapper" requires the variables to be globals. UGH.
IT does not appear to work with object parameters

http://repo.zebkit.org/latest/samples/uidemo.html#

## code stuff
https://idmnyu.github.io/p5.js-func/ ???

### better keyhandling
  - ~~separate out from main sketch file~~
  - consolidate keyhandling, so special keys can be modifiers (ctrl-x, or someting)
  - ~~multi-key input, so "1" or "11" or "111" with some key to start entry, time it out, or manually accept or cancel~~
  - ~~then multi-circles and all sorts of one-off experiments can have a move semi-permanent home~~
  - making use of Keypress (includes as script, ouch): https://github.com/dmauro/Keypress
  - also look at:
    - https://www.npmjs.com/package/stack-shortcuts
    - https://www.npmjs.com/package/@f/keychord
    - https://www.npmjs.com/package/hotkeys-js

## Things to implement
 - ~~font picker~~
   - web-fonts in project (not all in dropdown "really" exist)
 - random sized?
 - pick circle center
 - drag-n-zoom image (related code to pick center?)
 - draw into sub-section (click-n-drag to define)
 - more kalidoscopi features (eh, dunno)
   - ~~maybe just auto-quad with a "macro" ?~~
 - save/record animation
 - higher resolution
 - save all actions for replay (particularly for user when resize/up-resolution)
 - pass color context separately from grid-paint context
   - so if we paint a sub-grid, we can use a completely separate color pattern (any given section of super-grid)
 - background color selection
 - 4 LERPs
   - shuffle the four
   - store a nice palette locally