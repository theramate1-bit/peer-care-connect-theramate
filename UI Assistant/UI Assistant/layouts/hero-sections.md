# Hero Sections

## What is this?

A hero section is the large area at the top of a webpage that users see first when they land on your site. It's like the cover of a book - it sets the tone and tells users what your site is about.

**What it looks like:** A large, prominent area with a big heading, some descriptive text, often a background image or video, and usually a call-to-action button.

**When to use it:** Hero sections are used on landing pages, homepages, and marketing pages where you want to make a strong first impression.

## Why use this?

Hero sections solve several problems:

1. **First Impression:** Users decide in seconds whether to stay or leave. A good hero section makes them want to stay.
2. **Clear Communication:** Immediately tells users what your site/product is about.
3. **Visual Impact:** Large, bold design creates visual interest and draws attention.
4. **Call-to-Action:** Provides a clear place for the main action you want users to take.

**User Benefit:** Users quickly understand what they're looking at and what they can do next.

**Design Principle:** Follows visual hierarchy - the most important information (what you do, what action to take) is the most prominent.

## Step-by-Step Implementation

### 1. Set Up the Container

Create a full-width container for your hero section:
- Width: 100% (full width of the screen)
- Height: 100vh (full viewport height) or 80vh (80% of viewport height)
- Position: Relative (so you can position elements inside it)

### 2. Add Background (Optional)

If using a background image or video:
- Position: Absolute, covering the entire container
- Z-index: -1 (behind content)
- Opacity: Can be reduced (e.g., 0.8) if you have text overlay

### 3. Create Content Container

Inside the hero, create a centered content area:
- Max-width: 1200px (or your site's max content width)
- Padding: 120px top and bottom, 24px left and right
- Display: Flex, column direction
- Align-items: Center (centers content horizontally)
- Justify-content: Center (centers content vertically)

### 4. Add Main Heading (H1)

The most important text element:
- Font size: 48px to 72px (desktop), 32px to 48px (mobile)
- Font weight: Bold (700)
- Color: #FFFFFF (white) for dark backgrounds, #000000 (black) for light backgrounds
- Text align: Center
- Line height: 1.2 (tighter for large headings)
- Max-width: 800px (keeps text readable)

### 5. Add Descriptive Text

Supporting text below the heading:
- Font size: 18px to 24px (desktop), 16px to 18px (mobile)
- Font weight: Regular (400)
- Color: Slightly lighter than heading (e.g., #CCCCCC on dark, #666666 on light)
- Text align: Center
- Line height: 1.6 (comfortable reading)
- Max-width: 600px
- Margin-top: 24px (space below heading)

### 6. Add Call-to-Action Button

Primary action button:
- Background color: Your accent color (e.g., #007AFF)
- Text color: #FFFFFF (white)
- Padding: 16px horizontal, 12px vertical
- Border radius: 8px (rounded corners)
- Font size: 16px to 18px
- Font weight: Medium (500) or Semibold (600)
- Margin-top: 32px (space above button)
- Hover state: Slightly darker background or scale up to 1.02

### 7. Make It Responsive

Adjust for different screen sizes:
- **Desktop (1440px+):** Full hero with all elements
- **Tablet (768px-1439px):** Reduce padding to 80px, reduce heading to 40px
- **Mobile (375px-767px):** Reduce padding to 48px, heading to 32px, button full-width

## Exact Specifications

### Dark Mode Hero Section

**Container:**
- Background: #000000 or #0A0A0A (near-black)
- Width: 100%
- Height: 100vh
- Padding: 120px top/bottom, 24px left/right

**Heading (H1):**
- Font size: 64px (desktop), 40px (mobile)
- Font weight: 700 (bold)
- Color: #FFFFFF (pure white)
- Line height: 1.2
- Max-width: 800px
- Text align: Center

**Body Text:**
- Font size: 20px (desktop), 18px (mobile)
- Font weight: 400 (regular)
- Color: #CCCCCC (light gray)
- Line height: 1.6
- Max-width: 600px
- Margin-top: 24px

**Button:**
- Background: #007AFF (vibrant blue)
- Text: #FFFFFF (white)
- Padding: 16px 32px
- Border radius: 8px
- Font size: 18px
- Font weight: 600 (semibold)
- Margin-top: 32px

### Light Mode Hero Section

**Container:**
- Background: #FFFFFF (white)
- Width: 100%
- Height: 100vh
- Padding: 120px top/bottom, 24px left/right

**Heading (H1):**
- Font size: 64px (desktop), 40px (mobile)
- Font weight: 700 (bold)
- Color: #000000 (black)
- Line height: 1.2
- Max-width: 800px
- Text align: Center

**Body Text:**
- Font size: 20px (desktop), 18px (mobile)
- Font weight: 400 (regular)
- Color: #666666 (medium gray)
- Line height: 1.6
- Max-width: 600px
- Margin-top: 24px

**Button:**
- Background: #007AFF (vibrant blue)
- Text: #FFFFFF (white)
- Padding: 16px 32px
- Border radius: 8px
- Font size: 18px
- Font weight: 600 (semibold)
- Margin-top: 32px

### Responsive Breakpoints

- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1439px
- **Desktop:** 1440px and above

## Source Reference

This pattern comes from:
- Transcript: "Generalized Framer Design Patterns for LLM Recreation (Portfolio Analysis).md"
- Key concepts: 
  - Hero section almost always features large type (designer's name or impactful statement)
  - Large, impactful headings (H1) should be the most prominent element
  - Typography is often treated as a visual asset
  - Minimal navigation keeps focus on the work

- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - Large, centered content with full-width background video/image
  - H1 should be the most prominent element on the page
  - Creates visual impact and clear hierarchy
  - Headings should be large, bold weight

## Common Variations

### 1. Large Type Focus

**What it is:** Hero section dominated by oversized typography.

**When to use:** When you want maximum visual impact and the text itself is the design.

**Specifications:**
- Heading: 80px to 120px (desktop), 48px to 64px (mobile)
- Minimal supporting text
- Lots of white space around text

### 2. Background Media Hero

**What it is:** Hero with background image or video.

**When to use:** When you want visual storytelling or product showcase.

**Specifications:**
- Background: Full-cover image or video
- Overlay: Dark overlay (rgba(0, 0, 0, 0.5)) for text readability
- Content: Centered on top of background
- Text: White or light color for contrast

### 3. Split Hero

**What it is:** Hero divided into two columns (text on left, image on right, or vice versa).

**When to use:** When you want to show both text and visual content equally.

**Specifications:**
- Layout: Two-column grid (50/50 split)
- Desktop: Side by side
- Mobile: Stacked vertically (text first, then image)

### 4. Minimal Hero

**What it is:** Very simple hero with just heading and button, lots of white space.

**When to use:** For minimalist brands or when you want focus on simplicity.

**Specifications:**
- Minimal elements (heading, button, maybe one line of text)
- Generous padding (160px+)
- Clean, simple typography

## Things to Avoid

### 1. Too Much Text

**Problem:** Cramming too much information into the hero section.

**Why it's bad:** Overwhelms users, they won't read it all, defeats the purpose.

**Fix:** Keep it to heading, one or two sentences, and a button. Details go below.

### 2. Weak Visual Hierarchy

**Problem:** Everything the same size, nothing stands out.

**Why it's bad:** Users don't know where to look first.

**Fix:** Make heading much larger than body text. Make button prominent.

### 3. Poor Contrast

**Problem:** Text that's hard to read against background.

**Why it's bad:** Users can't read your message.

**Fix:** Ensure high contrast. White text on dark background, dark text on light background. Use overlay on images.

### 4. No Clear Call-to-Action

**Problem:** Hero section without a button or clear next step.

**Why it's bad:** Users don't know what to do next.

**Fix:** Always include a primary button with clear label (e.g., "Get Started", "Learn More").

### 5. Not Responsive

**Problem:** Hero that looks good on desktop but breaks on mobile.

**Why it's bad:** Most users are on mobile devices.

**Fix:** Test on all screen sizes. Reduce font sizes, adjust padding, stack elements vertically on mobile.

## Related Patterns

- [Navigation](./navigation.md) - Hero sections often sit below navigation
- [Grid Layouts](./grid-layouts.md) - Content below hero often uses grids
- [Scroll Animations](../animations/scroll-animations.md) - Hero content can fade in on load
- [Buttons](../components/buttons.md) - Hero sections include primary call-to-action buttons
- [Visual Hierarchy](../principles/visual-hierarchy.md) - Hero sections demonstrate strong hierarchy

---

**Next:** Learn about [Navigation](./navigation.md) patterns that work with hero sections.

