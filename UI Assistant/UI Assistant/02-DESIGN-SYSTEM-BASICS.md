# Design System Basics

## What is a Design System?

A design system is a collection of reusable rules, components, and guidelines that keep your design consistent. Think of it as a recipe book - instead of guessing how to make a button every time, you follow the recipe.

**Why it matters:** Design systems make everything look consistent, save time, and help teams work together. When you use the same colors, fonts, and spacing everywhere, your design feels professional and cohesive.

## Colors

### Why Colors Matter

Colors communicate meaning, create hierarchy, and set the mood of your application. They're one of the first things users notice.

### Color Categories

A complete design system needs these color types:

1. **Background Colors** - The base color of your page/screen
2. **Text Colors** - Colors for headings and body text
3. **Primary Color** - Your main brand color, used for key actions
4. **Secondary Color** - Supporting color for variety
5. **Accent Color** - Highlights and special elements
6. **Semantic Colors** - Success (green), Error (red), Warning (yellow), Info (blue)

### Dark Mode vs Light Mode

**Dark Mode** uses dark backgrounds (black or very dark gray) with light text. It's easier on the eyes in low light and feels modern.

**Light Mode** uses light backgrounds (white or light gray) with dark text. It's traditional and familiar.

**Modern Standard (2026):** Most applications support both. Always design for both modes.

### Dark Mode Color Specifications

**Background:** Near-black (#000000) or very dark gray (#0A0A0A)
- Provides professional, modern aesthetic
- Reduces eye strain in low light
- Creates high contrast for content

**Primary Text:** Pure white (#FFFFFF)
- Ensures high contrast and readability
- Standard for dark mode interfaces

**Accent Color:** Vibrant blue (#007AFF) or similar
- Used for primary call-to-action buttons
- Used for links and interactive elements
- Creates visual interest against dark background

**Source Reference:**
- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concept: Modern, high-contrast, dark-themed design with near-black background (#000000 or #0A0A0A), pure white text (#FFFFFF), and vibrant blue accent (#007AFF)

### Light Mode Color Specifications

**Background:** White (#FFFFFF) or very light gray (#FAFAFA)
- Clean, traditional look
- Familiar to most users

**Primary Text:** Dark gray (#1A1A1A) or black (#000000)
- High contrast for readability
- Standard for light mode

**Accent Color:** Your brand color (e.g., #007AFF)
- Used consistently for actions
- Should contrast well with light background

### Color Accessibility

**Contrast Ratio:** Text must have sufficient contrast with background for readability.

**Minimum Standards:**
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

**How to Check:** Use tools like WebAIM Contrast Checker or browser dev tools to verify contrast ratios.

**Example:** White text (#FFFFFF) on black background (#000000) has 21:1 contrast - excellent. Gray text (#808080) on light gray (#E0E0E0) has 2.1:1 contrast - fails accessibility standards.

**Source Reference:**
- Transcript: "world's shortest UIUX design course.txt"
- Key concept: Colors should be accessible and look good. Use tools to simulate color choices and ensure accessibility.

### Using Brand Colors Wisely

**The Problem:** Using your brand color everywhere (backgrounds, text, buttons, badges) makes everything compete for attention.

**The Solution:** Reserve brand color for key actions only. Use subtle colors for secondary elements.

**Example:**
- ✅ Use brand color for main "Sign Up" button
- ✅ Use gray or subtle colors for badges, chips, secondary buttons
- ❌ Don't use brand color for everything

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Tone down secondary elements with subtle strokes or lighter fills. Reserve brand color for key actions to help important elements stand out.

### Color Variations

Each color can have variations:
- **Shades:** Darker versions (add black)
- **Tints:** Lighter versions (add white)
- **Gradients:** Smooth transitions between colors
- **Transparent versions:** Colors with opacity (for overlays, backgrounds)

**Example Color Palette:**
```
Primary: #007AFF
Primary Light: #4DA3FF (tint)
Primary Dark: #0056CC (shade)
Primary 50% Opacity: rgba(0, 122, 255, 0.5)
```

## Typography

### Why Typography Matters

Typography (fonts and text styling) directly impacts readability. Good typography makes content easy to read and understand. Bad typography makes users skip your content.

### Font Selection

**Fonts give off a certain vibe:**
- **Funky:** Playful, creative fonts
- **Elegant:** Sophisticated, refined fonts
- **Serious:** Professional, trustworthy fonts
- **Childish:** Casual, friendly fonts

**Choose fonts that match your brand and purpose.**

**Source Reference:**
- Transcript: "world's shortest UIUX design course.txt"
- Key concept: Fonts directly impact readability and give off a certain vibe (funky, elegant, serious, childish).

### Font Categories

**Sans-Serif:** Modern, clean fonts without decorative strokes (e.g., Inter, Satoshi, Helvetica)
- Best for: UI elements, body text, modern designs
- Feel: Clean, contemporary, professional

**Serif:** Traditional fonts with decorative strokes (e.g., Times New Roman, Georgia)
- Best for: Long-form content, traditional designs
- Feel: Classic, formal, readable for long text

**Monospace:** Fixed-width fonts (e.g., Courier, Monaco)
- Best for: Code, technical content
- Feel: Technical, precise

### Modern Font Recommendations

**Popular Modern Fonts:**
- **Inter:** Clean, versatile, excellent for UI
- **Satoshi:** Modern, geometric, professional
- **Space Grotesque:** Unique, modern, distinctive
- **Ubuntu:** Friendly, readable, approachable

**Source Reference:**
- Transcript: "world's shortest UIUX design course.txt"
- Key concept: Examples include Space Grotesque and Ubuntu from Google Fonts.

### Typography Scale

A typography scale creates consistent text sizes. Use a ratio (like 1.25 or 1.5) to create harmonious sizes.

**Standard Responsive Sizes (2026):**
- **Title/Large Heading:** 32px (desktop), 24px (mobile)
- **Heading (H1):** 28px (desktop), 24px (mobile)
- **Subheading (H2):** 24px (desktop), 20px (mobile)
- **Body Text:** 18px (desktop), 16px (mobile)
- **Small Text:** 14px (desktop), 14px (mobile)
- **Caption:** 12px (desktop), 12px (mobile)

**Source Reference:**
- Transcript: "world's shortest UIUX design course.txt"
- Key concept: Standard responsive sizes: 18px for body text, 14px for small text, 32px for title.

### Line Height

Line height (space between lines) affects readability.

**Guidelines:**
- **Headings:** 1.2 to 1.4 (tighter, more compact)
- **Body Text:** 1.5 to 1.75 (comfortable reading)
- **Large Text:** 1.4 to 1.6

**Example:** 18px body text with 1.5 line height = 27px between baselines.

### Font Weight

Font weight (thickness) creates hierarchy.

**Common Weights:**
- **Light (300):** Delicate, elegant
- **Regular (400):** Standard, readable
- **Medium (500):** Slightly emphasized
- **Semibold (600):** Strong emphasis
- **Bold (700):** Maximum emphasis

**Usage:**
- Body text: Regular (400)
- Headings: Medium (500) or Semibold (600)
- Emphasis: Bold (700) sparingly

### Text Alignment

**Left Align:** Standard for body text, easiest to read
- Use for: Body text, paragraphs, lists

**Center Align:** Creates focus, use sparingly
- Use for: Headings, hero text, call-to-actions
- Avoid: Long paragraphs (hard to read)

**Right Align:** Rarely used, harder to read
- Avoid for text content
- Can use for: Numbers, dates, special layouts

**Important:** Keep alignment consistent. Don't mix center-aligned headings with left-aligned body text unless intentional.

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Keep alignment consistent. Don't have center-aligned icon and text, center-aligned heading, but left-aligned body copy. This creates confusion.

### Text Line Length

**The Problem:** Text that stretches across the entire screen width is hard to read.

**The Solution:** Limit line length to 50-80 characters (including spaces), ideally around 70 characters.

**How to Implement:**
- Set max-width on text containers (600-800px)
- Center the container
- This is why articles and blogs have narrow text columns

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Keep 50-80 characters per line, ideally 70. People shouldn't have to turn their head to read text.

## Spacing

### Why Spacing Matters

Spacing (padding, margins, gaps) creates breathing room, separates sections, and makes content easier to scan. White space doesn't mean wasted space - it improves readability.

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: White space does not always mean wasted space. It improves readability and gives content room to breathe.

### Spacing System

Use a consistent spacing system (like 4px, 8px, 16px, 24px, 32px, 48px, 64px) instead of random values.

**Common Spacing Scale:**
- **4px:** Tight spacing (icon to text, small gaps)
- **8px:** Small spacing (between small elements)
- **16px:** Standard spacing (between related elements)
- **24px:** Medium spacing (between sections)
- **32px:** Large spacing (major section breaks)
- **48px:** Extra large spacing (hero sections)
- **64px:** Maximum spacing (page-level breaks)

### Padding vs Margin

**Padding:** Space inside an element (between content and border)
- Use for: Button text, card content, input fields

**Margin:** Space outside an element (between elements)
- Use for: Space between cards, sections, components

### Section Spacing

**Generous vertical padding** between main content blocks creates clear separation.

**Standard Section Spacing:**
- **Small sections:** 48px top/bottom padding
- **Medium sections:** 80px top/bottom padding
- **Large sections:** 120px top/bottom padding

**Source Reference:**
- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concept: Use consistent vertical spacing (e.g., 120px top/bottom padding) for all major sections.

### Responsive Spacing

Spacing should scale with screen size:
- **Desktop:** Full spacing values (120px)
- **Tablet:** Reduced spacing (80px)
- **Mobile:** Compact spacing (48px)

## Icons

### Why Icons Matter

Icons are visual symbols that represent actions, features, or information. They're faster to recognize than text and save space.

### Icon Consistency

**The Problem:** Using different icon styles (some filled, some outlined, different widths) creates a disjointed, unprofessional feeling.

**The Solution:** Pick one icon set, choose one style, and stick with it everywhere.

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Pick a good icon set, choose a style, and stick with it. Using loads of icon styles creates a disjointed, inconsistent feeling.

### Recommended Icon Libraries

**Free Icon Libraries:**
- **Feather Icons:** Clean, minimal, outlined style
- **Untitled UI:** Comprehensive, modern, multiple styles
- **Heroicons:** Simple, clean, from Tailwind team
- **Huge Icons Library:** Extensive collection, free to use

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Personal recommendations: Feather Icons, Untitled UI, Huge Icons Library - all free to use.

### Icon Styles

**Outlined:** Icons with just the outline/stroke
- Feel: Light, modern, clean
- Best for: Most UI elements

**Filled:** Solid icons
- Feel: Bold, prominent
- Best for: Active states, emphasis

**Glyph:** Simple, minimal shapes
- Feel: Clean, modern
- Best for: Minimalist designs

**3D:** Three-dimensional icons
- Feel: Playful, modern
- Best for: Creative, fun applications

**Choose one style and use it consistently.**

### Icon Sizing

Icons should be sized consistently:
- **Small:** 16px (inline with small text)
- **Medium:** 20-24px (standard UI size)
- **Large:** 32px (prominent features)
- **Extra Large:** 48px+ (hero sections, major features)

### Icon Usage Exception

**Intentional Exception:** You can use a filled icon for an active state to show where the user is.

**Example:** Navigation menu uses outlined icons, but the home icon is filled when you're on the home page. This deliberate choice emphasizes the active state.

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Intentional exception - filled icon for home tab helps emphasize active state of navigation menu, making it clear where you are.

## Border Radius

### What is Border Radius?

Border radius creates rounded corners. It makes designs feel softer and more modern.

### Border Radius Alignment

**The Problem:** Border radius on nested elements (card, image inside, icon inside) don't align properly, creating visual gaps.

**The Solution:** Inner elements should have smaller border radius than outer elements.

**Formula:**
1. Identify all elements with radius (card, image, icon)
2. Measure the gap/padding between elements (e.g., 4px)
3. If image has 12px radius and 4px padding, card should have 16px radius (12 + 4)
4. If card has 16px radius and 4px padding, icon should have 12px radius (16 - 4)

**General Rule:** The deeper you go (more nested), the smaller the radius gets.

**Exception:** If the formula gives zero or negative values, just eyeball it. The main rule is inner elements always have smaller radius.

**Source Reference:**
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concept: Inner elements should always have smaller radius value. The deeper you go, the smaller the radius gets.

### Common Border Radius Values

- **Small:** 4px (subtle rounding)
- **Medium:** 8px (standard rounding)
- **Large:** 12px (noticeable rounding)
- **Extra Large:** 16px (very rounded)
- **Pill:** 50% or very large (fully rounded, for buttons)

## Related Patterns

- [Fundamentals](./01-FUNDAMENTALS.md) - Core design principles
- [Visual Hierarchy](./principles/visual-hierarchy.md) - Using size, color, spacing for importance
- [Consistency](./principles/consistency.md) - Maintaining consistency across your design
- [Quick Reference: Color Palettes](./quick-reference/color-palettes.md) - Quick lookup for color values
- [Quick Reference: Typography Scales](./quick-reference/typography-scales.md) - Quick lookup for font sizes
- [Quick Reference: Spacing System](./quick-reference/spacing-system.md) - Quick lookup for spacing values

---

**Next Step:** Explore specific patterns in the `layouts/`, `animations/`, and `components/` folders.

