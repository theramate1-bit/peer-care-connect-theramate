# Two-Column Layouts

## What is this?

A two-column layout divides the page into two main sections side by side. One column typically contains navigation or categories, the other contains the main content.

**What it looks like:** Like a book with a sidebar - left side has categories/filters/navigation, right side has the main content (images, cards, articles).

**When to use it:** Use for content-heavy sites where users need to browse categories (design galleries, product catalogs, documentation sites, dashboards).

## Why use this?

Two-column layouts solve navigation and browsing problems:

1. **Category Access:** Sidebar provides quick access to categories without leaving the page
2. **Content Focus:** Main column shows content while categories stay visible
3. **Efficient Browsing:** Users can switch categories and see content update without page reloads
4. **Familiar Pattern:** Users recognize this pattern from many successful sites

**User Benefit:** Users can quickly filter or navigate categories while viewing content, making browsing more efficient.

**Design Principle:** Follows progressive disclosure - show categories when needed, keep them accessible. Also follows user expectations - sidebar navigation is a familiar pattern.

## Step-by-Step Implementation

### 1. Create Main Container

Set up the two-column container:
- Display: Flex, row direction
- Width: 100%
- Max-width: 1440px (or your site's max width)
- Margin: 0 auto (centered)
- Gap: 20px to 32px (space between columns)

### 2. Create Left Column (Sidebar)

Set up the sidebar:
- Width: 250px to 300px (fixed width)
- Min-width: 200px (minimum on smaller screens)
- Padding: 24px
- Position: Can be sticky (stays visible while scrolling)
- Background: Slightly different from main content (subtle)

### 3. Create Right Column (Content)

Set up the main content area:
- Flex: 1 (takes remaining space)
- Padding: 24px
- Min-width: 0 (allows flex item to shrink)

### 4. Add Sidebar Content

In the left column, add:
- Category list or navigation
- Each category: Clickable, with active state
- Spacing: 16px between items
- Font size: 16px
- Active state: Different color or background

### 5. Add Main Content

In the right column, add:
- Grid of items (cards, images, etc.)
- Or: Single content area
- Responsive grid that adapts to available space

### 6. Make It Responsive

For mobile:
- Stack columns vertically (flex-direction: column)
- Sidebar: Full width, above content, or hidden in menu
- Content: Full width below sidebar

## Exact Specifications

### Desktop Two-Column Layout

**Main Container:**
- Display: Flex
- Flex-direction: Row
- Width: 100%
- Max-width: 1440px
- Margin: 0 auto
- Gap: 32px
- Padding: 24px

**Left Column (Sidebar):**
- Width: 280px (fixed)
- Position: Sticky, top: 80px (below navigation)
- Padding: 24px
- Background: #FAFAFA (light) or #1A1A1A (dark)
- Border-radius: 12px (optional, for card-like appearance)

**Sidebar Items:**
- Display: Flex, column
- Gap: 12px
- Font size: 16px
- Font weight: 500 (medium)
- Color: #000000 (light) or #FFFFFF (dark)
- Padding: 12px 16px
- Border-radius: 8px
- Hover: Background #F0F0F0 (light) or #2A2A2A (dark)
- Active: Background #007AFF, color #FFFFFF

**Right Column (Content):**
- Flex: 1
- Min-width: 0
- Padding: 0 (or 24px if needed)

### Tablet Two-Column Layout

**Main Container:**
- Same as desktop but:
- Gap: 24px
- Padding: 20px

**Left Column:**
- Width: 240px
- Can be collapsible/hidden

**Right Column:**
- Flex: 1

### Mobile Two-Column Layout

**Main Container:**
- Display: Flex
- Flex-direction: Column
- Gap: 16px
- Padding: 16px

**Left Column:**
- Width: 100%
- Position: Relative (not sticky)
- Or: Hidden in hamburger menu
- Padding: 16px

**Right Column:**
- Width: 100%
- Padding: 0

### Responsive Breakpoints

- **Mobile:** 375px - 767px (stacked vertically)
- **Tablet:** 768px - 1439px (can keep side-by-side or stack)
- **Desktop:** 1440px+ (side-by-side)

## Source Reference

This pattern comes from:
- Transcript: "Recreating the Awesome Amie.so Animations With Framer Motion - PART 2.txt"
- Key concepts:
  - Two-column layout with left column for categories/titles
  - Right column for main content (cards, images)
  - Left column can scroll independently
  - Right column has sticky positioning for content

- Transcript: "Recreating the Awesome Amie.so Animations With Framer Motion - part 12.txt"
- Key concepts:
  - Sidebar with category list on left
  - Main content area on right
  - Categories activate based on scroll position
  - Content updates based on active category

## Common Variations

### 1. Sticky Sidebar

**What it is:** Sidebar that stays visible while scrolling main content.

**When to use:** When you have long content and want categories always accessible.

**Specifications:**
- Position: Sticky, top: 80px (below navigation)
- Height: Fit-content or max-height: calc(100vh - 100px)
- Overflow: Auto (scrollable if too tall)

### 2. Collapsible Sidebar

**What it is:** Sidebar that can be hidden/shown with a button.

**When to use:** When you want more screen space for content on smaller screens.

**Specifications:**
- Toggle button: Top of sidebar or in navigation
- Hidden state: Transform translateX(-100%) or display: none
- Transition: 0.3s ease

### 3. Right Sidebar

**What it is:** Sidebar on the right instead of left.

**When to use:** Less common, but works if your design calls for it.

**Specifications:**
- Same as left sidebar, just swap positions
- Content on left, sidebar on right

### 4. Wide Content, Narrow Sidebar

**What it is:** Content takes most space (80%), sidebar is narrow (20%).

**When to use:** When content is the priority, sidebar is secondary.

**Specifications:**
- Sidebar: 20% width or 250px fixed
- Content: 80% width or flex: 1

### 5. Equal Columns

**What it is:** Both columns take equal space (50/50).

**When to use:** When both columns are equally important.

**Specifications:**
- Both columns: flex: 1 (equal width)
- Or: Both 50% width

## Things to Avoid

### 1. Sidebar Too Wide

**Problem:** Sidebar takes up too much space, content feels cramped.

**Why it's bad:** Wastes screen space, makes content area too narrow.

**Fix:** Keep sidebar 250-300px max. Content should be the priority.

### 2. Sidebar Not Sticky

**Problem:** Sidebar scrolls away with content.

**Why it's bad:** Users lose access to categories while scrolling.

**Fix:** Make sidebar sticky so it stays visible.

### 3. Poor Mobile Experience

**Problem:** Two columns side-by-side on mobile, everything too small.

**Why it's bad:** Unusable on small screens.

**Fix:** Always stack vertically on mobile. Sidebar above or in menu.

### 4. No Active State

**Problem:** Users can't tell which category is selected.

**Why it's bad:** Confusing, users don't know where they are.

**Fix:** Clearly highlight active category with different color or background.

### 5. Too Many Categories

**Problem:** Sidebar with 20+ categories, overwhelming.

**Why it's bad:** Hard to scan, decision paralysis.

**Fix:** Limit to 7-10 main categories. Group related items or use subcategories.

## Related Patterns

- [Navigation](./navigation.md) - Sidebar is a form of navigation
- [Sticky Elements](./sticky-elements.md) - Sidebars often use sticky positioning
- [Grid Layouts](./grid-layouts.md) - Content area often uses grids
- [Cards](../components/cards.md) - Content area often displays cards

---

**Next:** Learn about [Sticky Elements](./sticky-elements.md) for keeping elements visible while scrolling.

