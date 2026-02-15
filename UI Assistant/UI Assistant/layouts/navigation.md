# Navigation

## What is this?

Navigation is the menu system that helps users move around your website or application. It's like a map that shows users where they are and where they can go.

**What it looks like:** Usually a horizontal bar at the top of the page with links to different sections (Home, About, Services, Contact, etc.), often with a logo on the left and buttons on the right.

**When to use it:** Every website and application needs navigation. It's essential for users to find their way around.

## Why use this?

Navigation solves critical user problems:

1. **Orientation:** Users always know where they are in your site
2. **Discovery:** Users can find all available sections and features
3. **Efficiency:** Quick access to important pages without scrolling
4. **Consistency:** Same navigation everywhere creates familiarity

**User Benefit:** Users can quickly jump to any section without hunting around or using the back button.

**Design Principle:** Follows user expectations - after 30+ years of websites, users expect navigation at the top. Respecting this makes your site easier to use.

## Step-by-Step Implementation

### 1. Create Navigation Container

Set up the main navigation bar:
- Position: Sticky or fixed at top of viewport
- Width: 100% (full width)
- Height: 64px to 80px (standard navigation height)
- Background: Your background color (can be transparent or solid)
- Z-index: 100 or higher (stays on top when scrolling)
- Padding: 0px 24px (horizontal padding for content)

### 2. Add Logo

Place logo on the left side:
- Position: Left side of navigation
- Size: 32px to 48px height (proportional width)
- Margin: 0px (or small margin-right if you have links next to it)
- Clickable: Should link to homepage

### 3. Add Navigation Links

Create the main menu items:
- Display: Flex, row direction
- Gap: 24px to 32px between links
- Font size: 16px (standard for navigation)
- Font weight: 500 (medium) or 400 (regular)
- Color: Your text color
- Text decoration: None (no underlines)
- Hover state: Slightly darker/lighter color or underline

### 4. Add Primary Button (Optional)

If you have a call-to-action:
- Position: Right side of navigation
- Style: Primary button style (see [Buttons](../components/buttons.md))
- Margin-left: Auto (pushes to right)
- Common labels: "Sign Up", "Get Started", "Contact"

### 5. Make It Sticky

Keep navigation visible while scrolling:
- Position: Sticky, top: 0
- Or: Fixed, top: 0 (always visible, even at top)
- Background: Can add slight blur or solid background when scrolled

### 6. Create Mobile Menu

For smaller screens:
- Hide regular links on mobile (display: none below 768px)
- Add hamburger menu icon (three horizontal lines)
- Create slide-out or dropdown menu
- Menu should cover or overlay content
- Include close button (X icon)

## Exact Specifications

### Desktop Navigation

**Container:**
- Position: Sticky, top: 0
- Width: 100%
- Height: 64px
- Background: Transparent or #FFFFFF (light) / #000000 (dark)
- Padding: 0px 24px
- Z-index: 100
- Display: Flex
- Align-items: Center
- Justify-content: Space-between

**Logo:**
- Height: 32px
- Width: Auto (maintains aspect ratio)
- Margin-right: 32px (if links are next to it)

**Navigation Links:**
- Display: Flex
- Gap: 32px
- Font size: 16px
- Font weight: 500 (medium)
- Color: #000000 (light mode) or #FFFFFF (dark mode)
- Text decoration: None
- Hover: Color changes to #007AFF (accent color) or opacity 0.8

**Active Link:**
- Color: #007AFF (accent color)
- Font weight: 600 (semibold)
- Or: Underline or bottom border

**Primary Button:**
- Background: #007AFF
- Text: #FFFFFF
- Padding: 12px 24px
- Border radius: 8px
- Font size: 16px
- Font weight: 600
- Margin-left: Auto

### Mobile Navigation

**Container:**
- Same as desktop but:
- Height: 56px (slightly smaller)
- Padding: 0px 16px

**Hamburger Icon:**
- Size: 24px × 24px
- Color: Same as text color
- Position: Right side
- Display: Block on mobile (below 768px)
- Display: None on desktop

**Mobile Menu (when open):**
- Position: Fixed, full screen or slide from side
- Background: #FFFFFF (light) or #000000 (dark)
- Z-index: 200 (above everything)
- Padding: 24px
- Links: Stacked vertically
- Gap: 16px between links
- Font size: 18px (larger for touch)
- Close button: Top right, 32px × 32px

### Responsive Breakpoints

- **Mobile:** 375px - 767px (hamburger menu)
- **Tablet:** 768px - 1439px (can use hamburger or full menu)
- **Desktop:** 1440px+ (full horizontal menu)

## Source Reference

This pattern comes from:
- Transcript: "Generalized Framer Design Patterns for LLM Recreation (Portfolio Analysis).md"
- Key concepts:
  - Navigation is often simple, sometimes reduced to hamburger menu
  - Minimal navigation keeps focus on the work
  - Single-line header common pattern

- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - Sticky position at the top of the viewport
  - Responsive collapse for mobile (hamburger menu)
  - Logo, text links, primary button, search icon

- Transcript: "How to think like a GENIUS UIUX designer.txt"
- Key concepts:
  - Navigation at the top of the page (user expectation)
  - After 30+ years of websites, users expect certain layouts
  - Information flows top to bottom, left to right

## Common Variations

### 1. Minimal Navigation

**What it is:** Very simple navigation with just logo and a few links.

**When to use:** For portfolio sites, landing pages, or minimalist brands.

**Specifications:**
- Logo on left
- 3-5 links in center or right
- No background (transparent)
- Clean, simple typography

### 2. Centered Navigation

**What it is:** Logo in center, links on both sides.

**When to use:** For balanced, symmetrical designs.

**Specifications:**
- Logo: Center position
- Links: Split on left and right of logo
- Equal spacing on both sides

### 3. Right-Aligned Navigation

**What it is:** Logo on left, all links and buttons on right.

**When to use:** Most common pattern, works for most sites.

**Specifications:**
- Logo: Left side
- Links: Right side, grouped together
- Button: Far right

### 4. Transparent Navigation

**What it is:** Navigation with transparent background that becomes solid on scroll.

**When to use:** When you want navigation to blend with hero section initially.

**Specifications:**
- Background: Transparent or rgba(0, 0, 0, 0.1) initially
- On scroll: Background becomes solid (#FFFFFF or #000000)
- Smooth transition: 0.3s ease

### 5. Sticky Navigation with Auto-Hide

**What it is:** Navigation that hides when scrolling down, shows when scrolling up.

**When to use:** When you want maximum screen space while scrolling.

**Specifications:**
- Scroll down: Transform translateY(-100%) to hide
- Scroll up: Transform translateY(0) to show
- Transition: 0.3s ease
- Background: Solid when visible

## Things to Avoid

### 1. Too Many Links

**Problem:** Navigation with 10+ links crammed together.

**Why it's bad:** Overwhelming, hard to scan, looks cluttered.

**Fix:** Limit to 5-7 main links. Group related items or use dropdowns.

### 2. Unclear Active State

**Problem:** Users can't tell which page they're on.

**Why it's bad:** Users get lost, don't know where they are.

**Fix:** Clearly highlight active link with different color, bold weight, or underline.

### 3. Tiny Touch Targets (Mobile)

**Problem:** Links or buttons too small to tap easily on mobile.

**Why it's bad:** Frustrating, users miss taps, poor mobile experience.

**Fix:** Minimum 44px × 44px touch target size. Larger gaps between links.

### 4. Hidden Navigation

**Problem:** Navigation that's hard to find or always hidden.

**Why it's bad:** Users can't navigate, get frustrated, leave.

**Fix:** Navigation should always be accessible. Hamburger menu is fine, but it should be obvious.

### 5. Inconsistent Navigation

**Problem:** Navigation looks different on different pages.

**Why it's bad:** Breaks consistency, confuses users.

**Fix:** Keep navigation identical across all pages. Only active state should change.

## Related Patterns

- [Hero Sections](./hero-sections.md) - Navigation sits above hero sections
- [Sticky Elements](./sticky-elements.md) - Navigation uses sticky positioning
- [Buttons](../components/buttons.md) - Navigation often includes primary buttons
- [Consistency](../principles/consistency.md) - Navigation must be consistent across pages
- [Responsive Design](../principles/responsive-design.md) - Navigation adapts for mobile

---

**Next:** Learn about [Grid Layouts](./grid-layouts.md) for organizing content.

