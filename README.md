# Polychrome Text - p5.js version
Online @ https://michaelpaulukonis.github.io/polychrome.p5/

## Poly-WHAT???
Polychrome - or many colors.

Traditionally, text and image are segregated in Western Art.

This web-app plays with those boundaries, providing an polychromatic text painting environment.

> Although the word polychrome is created from the combining of two Greek words, it was not used in ancient Greece. The term was coined in the early nineteenth century by Antoine Chrysostôme Quatremère de Quincy. ([source](https://en.wikipedia.org/wiki/Ancient_Greek_art#Polychromy))


## Animations

Output multiple images
Run the `pcttool` to stitch them together using `ffmpeg` and  ImageMagick's `convert`

- `brew install ffmpeg` and `brew install imagemagick`
- more options at [StackOverflow](https://askubuntu.com/a/837574/613420)

See below for some ffmpeg notes


## Previous version
Conversion of my Processing.js text-app from [WebText sketches](https://github.com/MichaelPaulukonis/WebText)

Previous version online @ http://www.xradiograph.com/netart/024.html

## Dev notes
THIS IS A HORRIBLE MISH-MASH of procedural code, wannabe-functional-light code, and un-planned cowboy coding
GUI and core function are intermingled (although less so than originally)

## makes use of

- [dat.gui](https://github.com/dataarts/dat.gui)
- - [tutorial](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage)

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

## spirals

https://www.openprocessing.org/sketch/168364/
https://www.openprocessing.org/sketch/129166/ - I think this was the basis of my circle code

## other drawing options

http://genekogan.com/code/p5js-transformations/ - some of the combined transforms are interesting

## UI

https://github.com/bit101/quicksettings => the raw, unwrapped version looks like it should work better than the p5 gui wrapper
The "wrapper" requires the variables to be globals. UGH.
IT does not appear to work with object parameters

http://repo.zebkit.org/latest/samples/uidemo.html#

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
- ~s~ave/record animation~~
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
  

  ## Scripting

  It is now possible to record and playback most activity.
  Not all of it is recorded correctly, and needs work.
  Also, I'd really like to extend it by a simple language (ay-yi-yi) to allow for some looping.
  Have a look at https://www.npmjs.com/package/tracery-grammar and https://github.com/kyranet/tracery

  https://shiffman.net/a2z/cfg/


  ## SVG ???!??

  - https://github.com/zenozeng/p5.js-svg
  - https://stackoverflow.com/questions/5495952/draw-svg-on-html5-canvas-with-support-for-font-element
  


## ffmpeg

This will take all png files in a folder and make one .mp4 from all them.
The size will be of the largest image, with all other images centered (unscaled) and padded with black.
See [notes on `pad`](http://ffmpeg.org/ffmpeg-filters.html#pad) for more.


`ffmpeg -r 15 -f image2 -pattern_type glob -i '*.png' -vf pad="max(iw\,ih):ow:(ow-iw)/2:(oh-ih)/2" -vcodec libx264 -crf 17 -pix_fmt yuv420p 'combined.mp4'`


```
mogrify -path '/home/hamy/Documents/JP2_Wrangling/2DArtist_066/Processed' -verbose -quality 95 -format jpg *.jp2

magick mogrify -path './' -verbose  -format png *.jp2

magick mogrify -path './' -verbose -format jpg *.jp2

mkdir denslow
pdfimages -verbose -j denslow.goose.2003goudy25765.pdf ./denslow
```

for FILENAME in $(ls *.bpm; do convert $FILENAME ${FILENAME%.*}.png 

for x in *.webp; do dwebp {} -o ${x%.*}.png ::: $x; done

for x in *.bpm; do convert ${x%.*}.png ::: $x; done

convert *.pbm -set filename:fn '%[basename]' '%[filename:fn].png'

