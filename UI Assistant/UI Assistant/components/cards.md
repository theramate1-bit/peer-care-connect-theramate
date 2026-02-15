# Cards

## What is this?

A card is a container that groups related content together. It's like a small box that holds an image, title, description, and sometimes a button.

**What it looks like:** A rounded rectangle with padding, often with a shadow, containing an image at the top, title, description text, and sometimes a button or link.

**When to use it:** Use cards for displaying multiple items: products, blog posts, projects, features, testimonials. Cards work well in grids.

## Why use this?

Cards solve content organization problems:

1. **Grouping:** Related content is visually grouped together
2. **Scanning:** Easy to scan multiple items quickly
3. **Consistency:** All items get equal treatment
4. **Flexibility:** Works in grids, lists, or individually

**User Benefit:** Users can quickly browse and compare multiple items without feeling overwhelmed.

**Design Principle:** Follows the card pattern - content grouped in distinct containers. Also follows visual hierarchy - cards create clear separation between items.

## Step-by-Step Implementation

### 1. Create Container

- Background: #FFFFFF (light) or #1A1A1A (dark)
- Border radius: 12px (rounded corners)
- Padding: 24px
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.1) (subtle shadow)

### 2. Add Image (Optional)

- Width: 100%
- Height: 200px (or aspect ratio)
- Object fit: Cover
- Border radius: 8px (top corners only if image is at top)

### 3. Add Content

- Title: 18px, bold, margin-top: 16px
- Description: 14px, regular, color: #666666, margin-top: 8px
- Spacing: Consistent padding throughout

### 4. Add Hover State

- Scale: 1.02 to 1.05
- Shadow: More pronounced (0 4px 16px rgba(0, 0, 0, 0.15))
- Transform: TranslateY(-4px) (lifts up)
- Transition: 0.3s ease-out

## Exact Specifications

### Standard Card

**Container:**
- Background: #FFFFFF (light) or #1A1A1A (dark)
- Border radius: 12px
- Padding: 24px
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
- Max-width: None (flexible)

**Image:**
- Width: 100%
- Height: 200px
- Border radius: 8px
- Object-fit: Cover

**Title:**
- Font size: 18px
- Font weight: 600
- Color: #000000 (light) or #FFFFFF (dark)
- Margin-top: 16px

**Description:**
- Font size: 14px
- Font weight: 400
- Color: #666666 (light) or #CCCCCC (dark)
- Margin-top: 8px
- Line height: 1.6

**Hover:**
- Scale: 1.03
- Shadow: 0 4px 16px rgba(0, 0, 0, 0.15)
- Transform: TranslateY(-4px)
- Duration: 0.3s
- Easing: Ease-out

## Source Reference

This pattern comes from:
- Transcript: "Generalized Framer Design Patterns for LLM Recreation (Portfolio Analysis).md"
- Key concepts: Project cards include visual preview, title, description. Cards universally feature hover state.

## Common Variations

1. **Image Card:** Image-focused with minimal text
2. **Text Card:** Text-focused, no image
3. **Feature Card:** Icon, title, description
4. **Product Card:** Image, title, price, button
5. **Testimonial Card:** Quote, author, image

## Things to Avoid

1. **Too Much Content:** Keep cards focused
2. **Inconsistent Sizing:** Cards in grid should be same height
3. **No Hover State:** Cards should respond to hover
4. **Poor Spacing:** Use consistent padding
5. **Weak Shadows:** Shadows help cards stand out

## Related Patterns

- [Grid Layouts](../layouts/grid-layouts.md) - Cards are displayed in grids
- [Hover Effects](../animations/hover-effects.md) - Cards need hover states
- [Buttons](./buttons.md) - Cards often contain buttons

---

**Next:** Learn about [Forms](./forms.md) for user input.

