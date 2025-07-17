https://stackoverflow.com/questions/68528749/how-do-i-rotate-text-around-an-oval

Rotating text/ with some issues

Anyway, this has something of wht I might want???

sketch now @ https://editor.p5js.org/MichaelPaulukonis/sketches/TpMc2h5Uc


## Parameter movement

Params that auto-increment (or whatever) afer each paint operation
See the coreDraw code inside of OBSCURUS/sketch.js ~= L186


## Colors

I'd like to twiddle the color options more - have an offset, or something. wrap-around. I dunno. MORE.

Read up on color, m'kay?

Also, first candidate for skew-increments

- <https://krazydad.com/tutorials/makecolors.php>
- <https://www.tandika.com/2020/07/the-artists-husband-p5.js-colors/>
- <https://idmnyu.github.io/p5.js-func/>
- <https://github.com/mrchantey/p5.createLoop#readme> (not color)
- https://vuejsexamples.com/vue-gradient-picker-component/
- https://vuejsexamples.com/a-randomly-generated-collection-of-linear-gradients/
- https://vuejsexamples.com/beautiful-colour-gradients-for-design-and-code/
- https://saintplay.github.io/vue-swatches/
- https://nullice.github.io/ichiColor/demo/demo.html


### color picker

- https://vuetifyjs.com/en/components/color-pickers/#swatches
- http://xiaokaike.github.io/vue-color/
- https://github.com/xiaokaike/vue-color
- https://vuejsexamples.com/tag/color/

## alternate controls

- <https://www.tetoki.eu/vida/> - camera recognition.....


## Scripting

I have a dumb-as-rocks overly-verbose scripting things that uses JSON and whatnot.


But... Do I _need_ something more???


### Peg.js / Peggy.js

- [Peggy.js is he successor](https://github.com/peggyjs/peggy)
  - [online](https://peggyjs.org/online)
  - [tutorial for live-coding](http://alicelab.world/workshop_nime_2017/tutorial.html)
- <https://coderwall.com/p/316gba/beginning-parsers-with-peg-js>
- <https://tomassetti.me/parsing-in-javascript/>
- <https://medium.com/globant/peg-away-at-evaluating-expressions-in-javascript-15159511fa97>
- <https://github.com/gibber-cc/tidal.pegjs>
  - specifically <https://github.com/gibber-cc/tidal.pegjs/blob/master/dist/tidal.pegjs>
- <https://medium.com/globant/peg-away-at-evaluating-expressions-in-javascript-15159511fa97>


### Tracery

- <https://github.com/galaxykate/tracery>
- [npm-ified](https://github.com/v21/tracery)
- [has custom functions](https://github.com/dropecho/storygen)
- <https://github.com/serin-delaunay/cheapmarkovstracedquick>
- <https://github.com/fourtonfish/creative-bots>

## kaliedoscope

This is a fun variation, but might be going a bit afield of the purpose.
https://github.com/rbyte/Kaleidoscope
https://github.com/coldhead/kaleidos

## automation

I'm looking in automation via puppeteer.
It's a thought.

## Recursion/sub-grids

Instead of painting entire screen, paint repeating tiles - which is the thing the grid painter is doing already, on a letter-by-letter level.

So, who knows.

Would be nice to have the circles centered anywhere - larger, smaller, etc.

Everything is flat. No shadows, no dimensions, no pretend angles.

But.... someday? Who knows.

## spirals

https://www.openprocessing.org/sketch/168364/
https://www.openprocessing.org/sketch/129166/ - I think this was the basis of my circle code

## other drawing options

http://genekogan.com/code/p5js-transformations/ - some of the combined transforms are interesting

## code stuff

https://idmnyu.github.io/p5.js-func/ ???

### better keyhandling

- ~~separate out from main sketch file~~
- ~consolidate keyhandling, so special keys can be modifiers (ctrl-x, or someting)~
- ~~multi-key input, so "1" or "11" or "111" with some key to start entry, time it out, or manually accept or cancel~~
- ~~then multi-circles and all sorts of one-off experiments can have a move semi-permanent home~~
- making use of Keypress (includes as script, ouch): https://github.com/dmauro/Keypress
- also look at:
  - https://www.npmjs.com/package/stack-shortcuts
  - https://www.npmjs.com/package/@f/keychord
  - https://www.npmjs.com/package/hotkeys-js

## Things to implement

- ~~font picker~~
  - ~web-fonts in project (not all in dropdown "really" exist)~
- random sized?
- pick circle center
- drag-n-zoom image (related code to pick center?)
- draw into sub-section (click-n-drag to define)
- more kalidoscopic features (eh, dunno)
  - ~~maybe just auto-quad with a "macro" ?~~
- ~~save/record animation~~
- higher resolution
- save all actions for replay (particularly for user when resize/up-resolution)
  - in-progress. May need to redo the API to get it to work better
  - plus, I've never done a "scripting language" before
- pass color context separately from grid-paint context
  - so if we paint a sub-grid, we can use a completely separate color pattern (any given section of super-grid)
- background color selection
- 4 LERPs
  - ~shuffle the four~
  - store a nice palette locally
  - ~add/remove`
  - Find a better name than "lerp" !!!
- inset - inset on all sides

## in-prgress GUI redo

- https://github.com/quasarframework/quasar/blob/dev/ui/src/components/editor/QEditor.js
- https://github.com/vuegg/vuegg/blob/master/client/src/components/editor/main/Stage.vue
- https://github.com/cyrilf/microbios/blob/f8577c75e4990e54f76168239522cee996721e0c/src/store.js
- https://github.com/vuejs/awesome-vue#components--libraries

I ended up going with [Quicksettings](https://github.com/bit101/quicksettings.git) - it doesn't have a built-in save-selector, but I'm building my own, and it seems to work!

I started with a vue-version of Dat.gui, but had some difficulties getting the updated settings into the sketch. Some disconnect in my head, and quite possible with my mish-mash of passing-by-reference and use of `this` all over the place (ugh!).

I'm quite happy with the look of Quicksettings - it's not perfect, but has a few features I really like.

## color notes

- https://github.com/eligrey/color.js
- https://stackoverflow.com/questions/13806483/increase-or-decrease-color-saturation
- https://css-tricks.com/hsl-hsla-is-great-for-programmatic-color-control/
- https://www.w3schools.com/colors/colors_hsl.asp
- http://code.iamkate.com/javascript/colour-handling-and-processing/
- https://konvajs.org/docs/filters/HSL.html
- https://www.greatbigdigitalagency.com/blog/its-not-easy-being-bleen-a-color-changing-javascript-adventure
- COLOR SCHEMES: https://programmingdesignsystems.com/color/color-schemes/index.html
- https://medium.com/@behreajj/color-gradients-in-processing-v-2-0-e5c0b87cdfd2

- https://tylerxhobbs.com/essays/2016/working-with-color-in-generative-art
- http://printingcode.runemadsen.com/lecture-color/
- https://sighack.com/post/procedural-color-algorithms-monochromatic-color-scheme
- https://medium.com/@KristinHenry/coloring-generative-art-pages-522a5dd7f892
- http://colormind.io/
- https://www.wired.com/story/very-mathematical-history-perfect-color-combination/
- https://www.reddit.com/r/generative/comments/8n5osg/an_algorithm_to_generate_beautiful_color_palettes/
- https://chris.de/posts/an-algorithm-to-generate-color-palettes/

## Colors

Over time, my use/the use of color has come to be really important. That _is_ the core of the name, after all. And, TBH, when you're piling text on top of text, if they don't have different-enough colors you just get a blob.

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

### Joseph Albers

- https://www.brainpickings.org/2013/08/16/interaction-of-color-josef-albers-50th-anniversary/
- https://www.schirn.de/en/magazine/context/josef_albers_interaction_of_color_peter_halley_color_theory/
- https://acpress.amherst.edu/books/intersectingcolors/chapter/a-short-history-of-josef-alberss-interaction-of-color/
- https://albersfoundation.org/teaching/josef-albers/interaction-of-color/publications/
- http://www.louisapenfold.com/albers-interaction-of-color/
  
## SVG ???!??

- https://github.com/zenozeng/p5.js-svg
- https://stackoverflow.com/questions/5495952/draw-svg-on-html5-canvas-with-support-for-font-element



