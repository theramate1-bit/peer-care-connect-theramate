# Buttons

## What is this?

A button is a clickable element that triggers an action. It's one of the most important interactive elements in any interface.

**What it looks like:** A rectangular or rounded element with text or an icon, usually with a background color that stands out from the page.

**When to use it:** Use buttons for primary actions: submitting forms, navigating, confirming actions, starting processes.

## Why use this?

Buttons solve action problems:

1. **Clear Actions:** Makes it obvious what users can do
2. **Primary Actions:** Highlights the most important action on a page
3. **Feedback:** Provides clear target for clicks/taps
4. **Consistency:** Familiar pattern users recognize

**User Benefit:** Users immediately know what actions are available and can easily trigger them.

**Design Principle:** Follows visual hierarchy - buttons should stand out. Also follows the principle of clear labels - buttons should say exactly what they do.

## Step-by-Step Implementation

### 1. Set Base Styles

- Background: Primary color (#007AFF or your brand color)
- Text: White (#FFFFFF) or contrasting color
- Padding: 12px vertical, 24px horizontal
- Border radius: 8px (rounded corners)
- Font size: 16px
- Font weight: 600 (semibold)

### 2. Add Hover State

- Background: 10-20% darker than base
- Scale: 1.02 (slightly larger)
- Transition: 0.2s ease-out

### 3. Add Active/Press State

- Scale: 0.98 (slightly smaller, like being pressed)
- Transition: 0.1s ease-out

### 4. Add Disabled State

- Opacity: 0.5
- Cursor: Not-allowed
- No hover effects

## Exact Specifications

### Primary Button

**Default:**
- Background: #007AFF (vibrant blue)
- Text: #FFFFFF (white)
- Padding: 12px 24px
- Border radius: 8px
- Font size: 16px
- Font weight: 600
- Border: None

**Hover:**
- Background: #0056CC (20% darker)
- Scale: 1.02
- Duration: 0.2s
- Easing: Ease-out

**Active:**
- Scale: 0.98
- Duration: 0.1s

**Disabled:**
- Opacity: 0.5
- Cursor: Not-allowed

### Secondary Button

**Default:**
- Background: Transparent
- Border: 2px solid #007AFF
- Text: #007AFF
- Padding: 10px 22px (slightly less to account for border)

**Hover:**
- Background: #007AFF
- Text: #FFFFFF
- Duration: 0.2s

### Ghost Button

**Default:**
- Background: Transparent
- Text: #007AFF
- Border: None

**Hover:**
- Background: rgba(0, 122, 255, 0.1) (10% opacity blue)
- Duration: 0.2s

## Source Reference

This pattern comes from:
- Transcript: "7 UIUX Design Mistakes that I Wish I Knew as a Beginner.txt"
- Key concepts: Buttons should have clear, specific labels. Use "Delete Account" not "Yes". Use "Send Reset Link" not "Next".

## Common Variations

1. **Primary:** Solid background, prominent
2. **Secondary:** Outlined, less prominent
3. **Ghost:** Transparent, minimal
4. **Icon Button:** Button with icon only
5. **Full Width:** Button spans full container width

## Things to Avoid

1. **Vague Labels:** "Yes", "No", "Next" - use specific labels
2. **Too Small:** Minimum 44px × 44px for mobile
3. **Poor Contrast:** Ensure text is readable
4. **No Hover State:** Always add hover feedback
5. **Inconsistent Styles:** Use same button styles across site

## Related Patterns

- [Hover Effects](../animations/hover-effects.md) - Buttons need hover states
- [Micro-Interactions](../animations/micro-interactions.md) - Button press is a micro-interaction
- [Forms](./forms.md) - Buttons are used in forms

---

**Next:** Learn about [Cards](./cards.md) for displaying content.

