# Modals

## What is this?

A modal is a popup window that appears on top of the current page, requiring users to interact with it before continuing. It's like a dialog box.

**What it looks like:** A centered box with content, usually with a semi-transparent dark background (overlay) behind it, and a close button.

**When to use it:** Use modals for: confirmations (delete, logout), important information, forms, image galleries, detailed views.

## Why use this?

Modals solve focus and interruption problems:

1. **Focus:** Draws attention to important actions or information
2. **Context:** Keeps users on current page while showing additional content
3. **Confirmation:** Perfect for actions that need confirmation
4. **Details:** Shows additional information without navigation

**User Benefit:** Users can see important information or confirm actions without losing their place on the page.

**Design Principle:** Follows progressive disclosure - show additional content when needed. Also follows focus - modals demand attention.

## Step-by-Step Implementation

### 1. Create Overlay

- Position: Fixed, full screen
- Background: rgba(0, 0, 0, 0.5) (semi-transparent black)
- Z-index: 1000 (above everything)
- Backdrop blur: Optional (blurred background)

### 2. Create Modal Container

- Position: Fixed, centered
- Background: #FFFFFF (light) or #1A1A1A (dark)
- Border radius: 16px
- Padding: 24px
- Max-width: 500px (or 90% on mobile)
- Z-index: 1001 (above overlay)
- Box shadow: Large shadow for depth

### 3. Add Close Button

- Position: Top right
- Size: 32px × 32px
- Icon: X icon
- Hover: Slightly darker background

### 4. Add Content

- Title: 24px, bold, margin-bottom: 16px
- Body: 16px, regular, margin-bottom: 24px
- Actions: Buttons at bottom

### 5. Handle Escape Key

- Close modal when Escape key pressed
- Close when clicking overlay (optional)

## Exact Specifications

### Standard Modal

**Overlay:**
- Position: Fixed
- Top: 0, Left: 0, Right: 0, Bottom: 0
- Background: rgba(0, 0, 0, 0.5)
- Z-index: 1000
- Display: Flex
- Align-items: Center
- Justify-content: Center

**Modal Container:**
- Background: #FFFFFF (light) or #1A1A1A (dark)
- Border radius: 16px
- Padding: 24px
- Max-width: 500px
- Width: 90% (mobile)
- Box shadow: 0 8px 32px rgba(0, 0, 0, 0.2)
- Z-index: 1001
- Position: Relative

**Close Button:**
- Position: Absolute
- Top: 16px
- Right: 16px
- Size: 32px × 32px
- Border radius: 50% (circle)
- Background: Transparent
- Hover: rgba(0, 0, 0, 0.1)

**Animation:**
- Fade in: Opacity 0 → 1, Scale 0.95 → 1.0
- Duration: 0.3s
- Easing: Ease-out

## Source Reference

This pattern comes from:
- Transcript: "Recreating the Awesome Amie.so Animations With Framer Motion - PART 2.txt"
- Key concepts: Modals can animate in/out. Full-screen views with close functionality.

## Common Variations

1. **Confirmation Modal:** Simple yes/no confirmation
2. **Form Modal:** Modal with form inside
3. **Image Modal:** Full-screen image viewer
4. **Alert Modal:** Information or warning message

## Things to Avoid

1. **Too Large:** Keep modals reasonable size
2. **No Close Button:** Always provide way to close
3. **Poor Mobile:** Modals should work on mobile
4. **Too Many Modals:** Don't stack modals
5. **No Animation:** Modals should animate in/out

## Related Patterns

- [Buttons](./buttons.md) - Modals contain buttons
- [Page Transitions](../animations/page-transitions.md) - Modals use similar animation principles

---

**Next:** Learn about [Navigation Components](./navigation-components.md) for menus and navigation.

