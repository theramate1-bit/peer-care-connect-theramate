# Grid Layouts

## What is this?

A grid layout is a system for organizing content into rows and columns, like a table or spreadsheet. It helps you create structured, organized designs that look professional and are easy to scan.

**What it looks like:** Content arranged in a regular pattern - cards in rows and columns, images in a gallery, products in a shop. Everything aligns neatly.

**When to use it:** Use grids for displaying multiple items of the same type: project galleries, product listings, blog posts, image galleries, feature cards, testimonials.

## Why use this?

Grid layouts solve organization problems:

1. **Structure:** Creates order from chaos - multiple items look organized, not random
2. **Scanning:** Users can quickly scan rows and columns to find what they want
3. **Consistency:** All items get equal space and treatment
4. **Responsive:** Easy to adapt for different screen sizes (3 columns → 2 columns → 1 column)

**User Benefit:** Users can quickly browse and compare multiple items without feeling overwhelmed.

**Design Principle:** Follows the grid principle - structured, organized layouts are easier to understand than random placement.

## Step-by-Step Implementation

### 1. Create Grid Container

Set up the main grid:
- Display: Grid
- Grid template columns: Define how many columns
- Gap: Space between items (16px to 24px standard)
- Max-width: 1200px to 1440px (constrain width on large screens)
- Margin: Auto (centers grid on page)
- Padding: 24px (space around grid)

### 2. Define Column Structure

Set how many columns for each screen size:
- **Desktop (1440px+):** 3 columns
- **Tablet (768px-1439px):** 2 columns
- **Mobile (375px-767px):** 1 column

### 3. Add Grid Items

Each item in the grid:
- No special styling needed (grid handles positioning)
- Can have internal padding (16px to 24px)
- Should maintain consistent height with other items (or use auto)

### 4. Make It Responsive

Use CSS Grid or media queries:
- Desktop: `grid-template-columns: repeat(3, 1fr)`
- Tablet: `grid-template-columns: repeat(2, 1fr)`
- Mobile: `grid-template-columns: 1fr` (single column)

## Exact Specifications

### 3-Column Grid (Desktop)

**Container:**
- Display: Grid
- Grid template columns: repeat(3, 1fr) (3 equal columns)
- Gap: 24px (space between items)
- Max-width: 1200px
- Margin: 0 auto (centered)
- Padding: 24px

**Grid Items:**
- No specific width needed (grid handles it)
- Min-height: 200px (prevents items from being too short)
- Padding: 16px (internal spacing)

### 2-Column Grid (Tablet)

**Container:**
- Display: Grid
- Grid template columns: repeat(2, 1fr) (2 equal columns)
- Gap: 20px
- Max-width: 1200px
- Margin: 0 auto
- Padding: 20px

**Grid Items:**
- Min-height: 180px
- Padding: 16px

### 1-Column Grid (Mobile)

**Container:**
- Display: Grid
- Grid template columns: 1fr (single column)
- Gap: 16px
- Max-width: 100%
- Margin: 0
- Padding: 16px

**Grid Items:**
- Width: 100%
- Min-height: 150px
- Padding: 16px

### Responsive Breakpoints

- **Mobile:** 375px - 767px (1 column)
- **Tablet:** 768px - 1439px (2 columns)
- **Desktop:** 1440px+ (3 columns)

## Source Reference

This pattern comes from:
- Transcript: "Generalized Framer Design Patterns for LLM Recreation (Portfolio Analysis).md"
- Key concepts:
  - Grid is a structured, organized layout pattern
  - Responsive grid layouts for project galleries and case studies
  - Primary method for displaying projects is a responsive grid (2-column or 3-column on desktop)

- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - Utilize Framer's Grid or Stack components for responsive grid
  - Create 3-column layout on desktop, collapsing gracefully on smaller breakpoints
  - Content grid system for displaying resources and blog posts

## Common Variations

### 1. Masonry Grid

**What it is:** Grid where items have different heights, creating a staggered, Pinterest-like layout.

**When to use:** For image galleries or content with varying heights.

**Specifications:**
- Use CSS columns or JavaScript library
- Column count: 3 (desktop), 2 (tablet), 1 (mobile)
- Gap: 16px to 24px

### 2. Asymmetric Grid

**What it is:** Grid with one large featured item and smaller items around it.

**When to use:** When you want to highlight one item (featured project, main product).

**Specifications:**
- Large item: Spans 2 columns and 2 rows
- Small items: Regular 1×1 grid cells
- Creates visual hierarchy

### 3. Auto-Fit Grid

**What it is:** Grid that automatically adjusts number of columns based on available space.

**When to use:** When you want flexible, responsive layout without media queries.

**Specifications:**
- `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- Items minimum 300px wide
- Automatically creates as many columns as fit

### 4. Card Grid

**What it is:** Grid specifically for card components (project cards, product cards, feature cards).

**When to use:** For displaying cards in an organized layout.

**Specifications:**
- Same as standard grid
- Cards have: Image, title, description, button
- Cards have hover states (see [Cards](../components/cards.md))

## Things to Avoid

### 1. Too Many Columns

**Problem:** 4+ columns on desktop makes items too narrow.

**Why it's bad:** Items become cramped, hard to read, look cluttered.

**Fix:** Maximum 3 columns on desktop. 2 columns is often better.

### 2. Inconsistent Gaps

**Problem:** Different spacing between items in the grid.

**Why it's bad:** Looks unprofessional, creates visual chaos.

**Fix:** Use consistent gap value throughout. Don't mix margins and gaps.

### 3. Items Too Small

**Problem:** Grid items so small that content is cramped.

**Why it's bad:** Hard to read, poor user experience.

**Fix:** Ensure minimum item width of 300px. Use fewer columns if needed.

### 4. Not Responsive

**Problem:** Same grid on all screen sizes.

**Why it's bad:** Mobile users see tiny, unusable items.

**Fix:** Always make grids responsive. 3 columns → 2 columns → 1 column.

### 5. Uneven Item Heights

**Problem:** Items in same row have very different heights.

**Why it's bad:** Creates visual imbalance, looks messy.

**Fix:** Set consistent min-height or use flexbox to align items. Or use masonry grid if heights vary naturally.

## Related Patterns

- [Cards](../components/cards.md) - Grids often contain card components
- [Two-Column Layouts](./two-column-layouts.md) - Alternative layout pattern
- [Responsive Design](../principles/responsive-design.md) - Grids must be responsive
- [Visual Hierarchy](../principles/visual-hierarchy.md) - Grids create organized hierarchy

---

**Next:** Learn about [Two-Column Layouts](./two-column-layouts.md) for sidebar patterns.

