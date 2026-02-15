# Page Transitions

## What is this?

Page transitions are animations that happen when users navigate from one page to another. Instead of an instant jump, content smoothly fades, slides, or morphs from one page to the next.

**What it looks like:** Click a link, the current page fades out or slides away, and the new page fades in or slides in. Everything feels smooth and connected.

**When to use it:** Use page transitions for single-page applications (SPAs) or multi-page sites where you want smooth navigation. They make navigation feel more polished and intentional.

## Why use this?

Page transitions solve navigation problems:

1. **Continuity:** Makes navigation feel smooth and connected, not jarring
2. **Feedback:** Users see their navigation action is being processed
3. **Polish:** Adds professional, polished feel to the experience
4. **Context:** Helps users understand they're moving to a new section

**User Benefit:** Navigation feels smooth and intentional, not like jumping between disconnected pages.

**Design Principle:** Follows the principle that animations should add clarity - transitions help users understand navigation is happening.

## Step-by-Step Implementation

### 1. Set Exit Animation

Define how current page leaves:
- Opacity: 1 → 0 (fade out)
- Transform: TranslateX(0) → -100px (slide left) or TranslateX(0) → 100px (slide right)
- Duration: 0.3s to 0.5s

### 2. Set Enter Animation

Define how new page enters:
- Opacity: 0 → 1 (fade in)
- Transform: TranslateX(100px) → 0 (slide in from right) or TranslateX(-100px) → 0 (slide in from left)
- Duration: 0.3s to 0.5s

### 3. Coordinate Timing

Ensure exit and enter happen smoothly:
- Exit starts first
- Enter starts slightly after (or simultaneously)
- Total transition: 0.4s to 0.6s

### 4. Handle Loading

If page needs to load:
- Show loading state during transition
- Complete transition after content loads

## Exact Specifications

### Fade Transition

**Exit (Current Page):**
- Opacity: 1 → 0
- Duration: 0.3s
- Easing: Ease-in

**Enter (New Page):**
- Opacity: 0 → 1
- Duration: 0.3s
- Easing: Ease-out
- Delay: 0s (simultaneous with exit)

### Slide Transition

**Exit (Current Page):**
- Opacity: 1 → 0
- Transform: TranslateX(0) → -100px (slides left)
- Duration: 0.3s
- Easing: Ease-in

**Enter (New Page):**
- Opacity: 0 → 1
- Transform: TranslateX(100px) → 0 (slides in from right)
- Duration: 0.3s
- Easing: Ease-out
- Delay: 0s

### Combined Fade + Slide

**Exit:**
- Opacity: 1 → 0
- Transform: TranslateX(0) → -50px
- Duration: 0.4s
- Easing: Ease-in

**Enter:**
- Opacity: 0 → 1
- Transform: TranslateX(50px) → 0
- Duration: 0.4s
- Easing: Ease-out
- Delay: 0s

## Source Reference

This pattern comes from:
- Transcript: "Animating transitions between pages in Framer (Animation Lesson 14).txt"
- Key concepts: Smooth transitions between pages create continuity and polish

## Common Variations

### 1. Fade Only
- Simple opacity transition
- Best for: Minimal designs

### 2. Slide Horizontal
- Pages slide left/right
- Best for: Horizontal navigation (tabs, sections)

### 3. Slide Vertical
- Pages slide up/down
- Best for: Vertical navigation (sections, articles)

### 4. Scale Transition
- Pages scale in/out
- Best for: Modal-like navigation

## Things to Avoid

1. **Too Slow:** Keep under 0.5s total
2. **Too Fast:** At least 0.2s to be noticeable
3. **No Transition:** Instant jumps feel jarring
4. **Complex Transitions:** Keep it simple and fast

## Related Patterns

- [Scroll Animations](./scroll-animations.md) - Similar animation principles
- [Micro-Interactions](./micro-interactions.md) - Page transitions are a type of micro-interaction

---

**Next:** Learn about [Micro-Interactions](./micro-interactions.md) for small, delightful details.

