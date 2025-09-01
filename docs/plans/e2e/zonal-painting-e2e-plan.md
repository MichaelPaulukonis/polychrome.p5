### Zonal Painting E2E Test Plan

**1. Test Suite Setup:**
*   Use Playwright's `test.describe` to group tests for "Zonal Painting Feature".
*   `beforeEach` hook to navigate to the application root (`/`) and wait for p5.js to be ready using `waitForP5Ready`.
*   `setupConsoleErrorTracking` to capture and assert on console errors.

**2. Test Cases:**

*   **Test Case 1: Zone Definition and Visual Feedback**
    *   **Action:** Click "Define Zone" button using `clickGuiButton(page, 'Define Zone')`.
    *   **Action:** Simulate mouse drag on canvas using `simulatePaintGesture` (e.g., from {x: 100, y: 100} to {x: 200, y: 200}).
    *   **Assertion:** Verify that `globals.isDefiningZone` is true during drag using `page.evaluate` to check `window.pchrome.globals.isDefiningZone`.
    *   **Assertion:** After `mouseReleased`, verify `window.pchrome.globals.isDefiningZone` is false, `window.pchrome.globals.isZoneActive` is true, and `window.pchrome.globals.zoneExists` is true.
    *   **Visual Assertion:** Take a screenshot (`page.screenshot()`) and visually inspect that the dashed preview appears during drag and a solid red border appears after release. (Manual inspection for now, but can be automated with pixelmatch later).
    *   **Error Assertion:** No console errors.

*   **Test Case 2: Confined Painting within Active Zone**
    *   **Setup:** Define a zone (re-use steps from Test Case 1).
    *   **Action:** Simulate a paint gesture *inside* the defined zone using `simulatePaintGesture`.
    *   **Assertion:** Verify that painting only occurs within the red border (visual inspection via screenshot).
    *   **Action:** Simulate a paint gesture *outside* the defined zone using `simulatePaintGesture`.
    *   **Assertion:** Verify that no painting occurs outside the zone (visual inspection via screenshot).
    *   **Error Assertion:** No console errors.

*   **Test Case 3: Zone Deactivation and Main Canvas Painting**
    *   **Setup:** Define a zone and paint something inside it.
    *   **Action:** Click "Toggle Zone" button using `clickGuiButton(page, 'Toggle Zone')`.
    *   **Assertion:** Verify `window.pchrome.globals.isZoneActive` is false.
    *   **Visual Assertion:** Verify the zone border changes to dashed gray.
    *   **Action:** Simulate a paint gesture anywhere on the canvas.
    *   **Visual Assertion:** Verify painting occurs on the main canvas, ignoring the zone.
    *   **Error Assertion:** No console errors.

*   **Test Case 4: Zone Reactivation and Content Preservation**
    *   **Setup:** Define a zone, paint in it, then deactivate it. Paint something on the main canvas *over* the inactive zone area.
    *   **Action:** Click "Toggle Zone" button (to reactivate).
    *   **Assertion:** Verify `window.pchrome.globals.isZoneActive` is true.
    *   **Visual Assertion:** Verify the zone border changes back to solid red.
    *   **Visual Assertion:** Verify that the content previously painted *inside* the zone before deactivation is still present, and the content painted *over* the inactive zone is now visible *underneath* the zone's content.
    *   **Error Assertion:** No console errors.

*   **Test Case 5: Clearing the Zone**
    *   **Setup:** Define a zone and paint something inside it.
    *   **Action:** Click "Clear Zone" button using `clickGuiButton(page, 'Clear Zone')`.
    *   **Assertion:** Verify `window.pchrome.globals.zoneExists` is false, `window.pchrome.globals.isZoneActive` is false.
    *   **Visual Assertion:** Verify the zone border disappears.
    *   **Visual Assertion:** Verify that the content previously painted *within* the zone remains on the main canvas (it's not cleared with the zone definition).
    *   **Error Assertion:** No console errors.

**3. Helper Functions (to be used or created in `test/e2e/utils/canvas-utils.js`):**
*   `clickGuiButton(page, buttonText)`: Clicks a button in the QuickSettings GUI.
*   `simulateMouseDrag(page, startX, startY, endX, endY)`: Simulates a mouse drag gesture.
*   `getGlobalState(page, stateKey)`: Retrieves a specific global state variable from `sketch.js` via `page.evaluate`.
*   `takeScreenshot(page, filename)`: Takes a screenshot for visual inspection.