# Sticky Elements

## What is this?

A sticky element is one that "sticks" to a certain position on the screen while you scroll. It stays in place while other content scrolls past it.

**What it looks like:** Like a navigation bar that stays at the top while you scroll, or a sidebar that stays visible while main content scrolls, or an image that stays centered while text scrolls around it.

**When to use it:** Use sticky positioning for elements you want users to always see: navigation bars, sidebars, important buttons, or images you want to keep in view.

## Why use this?

Sticky elements solve visibility problems:

1. **Always Accessible:** Important elements (like navigation) stay accessible without scrolling back
2. **Context:** Sidebars or images stay visible while related content scrolls
3. **Efficiency:** Users don't have to scroll to top to access navigation
4. **Visual Interest:** Creates engaging scroll experiences (images that stay while content moves)

**User Benefit:** Users can always access important navigation or see key content without losing their place.

**Design Principle:** Follows progressive disclosure - keep essential tools (navigation) always available while revealing content as needed.

## Step-by-Step Implementation

### 1. Set Position Property

Make element sticky:
- Position: Sticky
- Top: 0 (sticks to top) or other value (e.g., 80px to be below navigation)
- Z-index: Ensure it's above scrolling content (100+)

### 2. Define Sticky Container

The element needs a parent container to stick within:
- Parent must have enough height to scroll
- Sticky element will stick within its parent's bounds
- Once parent scrolls past, sticky element scrolls with it

### 3. Set Sticky Boundaries

Define where it sticks:
- Top: 0 (sticks to top of viewport)
- Or: Top: 80px (sticks below navigation)
- Or: Bottom: 0 (sticks to bottom - less common)

### 4. Handle Background

If element overlaps content:
- Add background color (solid or with blur)
- Prevents content showing through
- Can add subtle shadow for depth

### 5. Test Scroll Behavior

Verify it works correctly:
- Element sticks when scrolling down
- Element scrolls away when parent container ends
- No layout shifts or jumping

## Exact Specifications

### Sticky Navigation

**Container:**
- Position: Sticky
- Top: 0
- Z-index: 100
- Width: 100%
- Background: #FFFFFF (light) or #000000 (dark) or rgba(255, 255, 255, 0.95) with backdrop-blur
- Padding: 16px 24px
- Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) (subtle shadow when sticky)

### Sticky Sidebar

**Container:**
- Position: Sticky
- Top: 80px (below navigation)
- Height: Fit-content or max-height: calc(100vh - 100px)
- Width: 280px (fixed)
- Overflow-y: Auto (scrollable if content is tall)
- Z-index: 10

### Sticky Image (Scroll Story)

**Container:**
- Position: Sticky
- Top: 50% (centered vertically)
- Transform: translateY(-50%) (centers it)
- Height: 100vh (full viewport height)
- Width: 50% (or your desired width)
- Z-index: 5

**Parent Container:**
- Height: 300vh (3x viewport height - gives room to scroll)
- This allows image to stay sticky while content scrolls

### Responsive Considerations

**Mobile:**
- Sticky navigation: Keep sticky (essential)
- Sticky sidebar: Usually remove sticky, becomes regular content
- Sticky images: Often removed on mobile (takes too much space)

## Source Reference

This pattern comes from:
- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - Sticky position at the top of the viewport
  - Navigation bar remains visible on scroll
  - Implement a fixed/sticky header component

- Transcript: "Recreating the Awesome Amie.so Animations With Framer Motion - part 12.txt"
- Key concepts:
  - Sticky positioning for content area
  - Image stays in center while text scrolls
  - Parent container with extra height to enable sticky behavior

- Transcript: "Recreating the Awesome Amie.so Animations With Framer Motion - PART 2.txt"
- Key concepts:
  - Sticky positioning for right column content
  - Content stays visible while left column scrolls
  - Height of 300vh (3x viewport) for parent to enable scrolling

## Common Variations

### 1. Sticky Navigation with Background Change

**What it is:** Navigation that's transparent initially, becomes solid when scrolling.

**When to use:** When you want navigation to blend with hero section initially.

**Specifications:**
- Initial: Background transparent or rgba(0, 0, 0, 0.1)
- On scroll: Background becomes solid (#FFFFFF or #000000)
- Transition: 0.3s ease
- Can add backdrop-blur for glass effect

### 2. Sticky Sidebar with Scroll

**What it is:** Sidebar that sticks but scrolls if content is too tall.

**When to use:** When sidebar has many items that don't fit on screen.

**Specifications:**
- Position: Sticky
- Top: 80px
- Max-height: calc(100vh - 100px)
- Overflow-y: Auto
- Scrollbar: Can style or hide

### 3. Sticky Image with Text Scroll

**What it is:** Image stays centered while text content scrolls past it.

**When to use:** For storytelling or showcasing products with descriptions.

**Specifications:**
- Image: Position sticky, top: 50%, transform: translateY(-50%)
- Parent: Height 300vh (3x viewport) or more
- Text: Scrolls normally around sticky image

### 4. Sticky Call-to-Action

**What it is:** Important button that sticks to bottom of screen.

**When to use:** For mobile, keeping primary action always accessible.

**Specifications:**
- Position: Sticky
- Bottom: 0
- Width: 100%
- Z-index: 100
- Background: Solid color
- Padding: 16px

### 5. Auto-Hide Sticky Navigation

**What it is:** Navigation that hides when scrolling down, shows when scrolling up.

**When to use:** When you want maximum screen space while scrolling.

**Specifications:**
- Scroll down: Transform translateY(-100%) to hide
- Scroll up: Transform translateY(0) to show
- Transition: 0.3s ease
- Uses JavaScript to detect scroll direction

## Things to Avoid

### 1. Too Many Sticky Elements

**Problem:** Multiple elements trying to stick at once.

**Why it's bad:** Creates visual chaos, elements overlap, confusing.

**Fix:** Limit to 1-2 sticky elements max. Usually just navigation.

### 2. Sticky Element Overlaps Content

**Problem:** Sticky element covers important content when it sticks.

**Why it's bad:** Users can't see content, frustrating experience.

**Fix:** Add padding-top to content below sticky element. Or ensure sticky element has background.

### 3. Sticky on Mobile Without Need

**Problem:** Sticky sidebar on mobile takes up valuable screen space.

**Why it's bad:** Mobile screens are small, sticky elements waste space.

**Fix:** Remove sticky on mobile for non-essential elements. Keep only navigation sticky.

### 4. Sticky Element Jumps

**Problem:** Element "jumps" or shifts when it becomes sticky.

**Why it's bad:** Jarring experience, looks broken.

**Fix:** Ensure element dimensions don't change. Add smooth transitions.

### 5. Sticky Beyond Parent

**Problem:** Element stays sticky even after parent container ends.

**Why it's bad:** Element appears to float, disconnected from content.

**Fix:** Sticky only works within parent. Ensure parent has defined height and scrolling.

## Related Patterns

- [Navigation](./navigation.md) - Navigation often uses sticky positioning
- [Two-Column Layouts](./two-column-layouts.md) - Sidebars in two-column layouts are often sticky
- [Scroll Animations](../animations/scroll-animations.md) - Sticky elements work with scroll animations
- [Hero Sections](./hero-sections.md) - Navigation sticks below hero sections

---

**Next:** Explore [Animation Patterns](../animations/) to add motion to your layouts.

