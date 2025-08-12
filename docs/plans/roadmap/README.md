# Polychrome.p5 Future Ideas Roadmap

This document outlines potential features, refactorings, and improvements for the Polychrome.p5 project. Ideas listed here are not prioritized unless explicitly stated.

## Current Ideas:

- [ ] **Zonal Painting Enhancements:**
  - [ ] Zone transformations (rotation, scaling).
  - [ ] Zone dragging/moving/centering
  - [ ] Zone erasing and dragging (non-destructive zone overlays)
  - [ ] Support for multiple active zones.
  - [ ] Non-rectangular zone shapes (e.g., circular, polygonal).
- [ ] **Refactoring for Testability:**
  - [ ] Refactor `require.context` usage (see `01-require-context-refactoring.md` for details).  
- [ ] **Advanced Text Manipulation:**
  - [ ] Text on a path.
  - [ ] Text warping/distortion effects.
- [ ] **Performance Improvements:**
  - [ ] WebGL rendering for p5.js (if compatible with existing features).
  - [ ] Optimized canvas operations.
- [ ] **UI/UX Improvements:**
  - [ ] UI overhaul
    - https://lil-gui.georgealways.com/examples/kitchen-sink/
    - It's a dat.gui almost-drop-in. And comes with the same visual baggage.
  - [ ] More intuitive color picker.
  - [ ] Customizable hotkeys.
- [ ] Parameter skewing (stubs exist in code)  
- [ ] a first-class layer system
  - [ ] one that would have _all_ features apply to it as the active target. 
  - [ ] layers can be re-ordered
- [ ] drawing scale option - not for drawing to display, but to scale in-canvas sizes
- [ ] fix all `.skip` e2e tests
