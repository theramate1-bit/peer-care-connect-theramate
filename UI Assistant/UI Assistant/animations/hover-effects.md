# Hover Effects

## What is this?

A hover effect is a visual change that happens when you move your mouse cursor over an interactive element (like a button, link, or card). It's like the element "waking up" to show you it's clickable.

**What it looks like:** When you move your mouse over a button, it might get slightly bigger, change color, or lift up. When you move away, it returns to normal.

**When to use it:** Use hover effects on any clickable element: buttons, links, cards, navigation items, images. It helps users understand what's interactive.

## Why use this?

Hover effects solve important user experience problems:

1. **Clarity:** Makes it super clear if something is clickable in the first place
2. **Feedback:** Gives users tangible feedback that their cursor is over an interactive element
3. **Delight:** Small touches make experiences feel more alive and polished
4. **Navigation:** Helps visitors navigate with less effort - they know what's clickable

**User Benefit:** Users immediately understand what they can interact with, reducing confusion and making navigation easier.

**Design Principle:** Follows the feedback principle - users need to know their actions are recognized. Hover effects provide instant visual feedback.

## Step-by-Step Implementation

### 1. Select the Element

Choose the element you want to add a hover effect to (button, card, link, etc.).

### 2. Add Hover State

Set up what the element should look like when hovered:
- Scale: Slightly larger (1.02 to 1.1) or smaller
- Color: Slightly darker/lighter background or text color
- Opacity: Can change opacity (though less common)
- Transform: Can move slightly (offset) or rotate

### 3. Set Transition

Define how the change happens:
- Duration: 0.2s to 0.3s (quick, responsive)
- Easing: Ease-out (most common) or spring
- Delay: Usually 0s (instant response)

### 4. Test the Effect

Preview to ensure it feels responsive and natural.

## Exact Specifications

### Button Hover Effect

**Default State:**
- Background: #007AFF (primary blue)
- Scale: 1.0 (normal size)
- Opacity: 1.0 (fully visible)

**Hover State:**
- Background: #0056CC (darker blue, 20% darker)
- Scale: 1.02 (2% larger)
- Transform: None
- Opacity: 1.0

**Transition:**
- Duration: 0.2s (200ms)
- Easing: Ease-out
- Delay: 0s

### Card Hover Effect

**Default State:**
- Scale: 1.0
- Background: #FFFFFF (light) or #1A1A1A (dark)
- Shadow: Subtle (0 2px 8px rgba(0, 0, 0, 0.1))

**Hover State:**
- Scale: 1.02 to 1.05 (2-5% larger)
- Background: Slightly lighter/darker (5% change)
- Shadow: More pronounced (0 4px 16px rgba(0, 0, 0, 0.15))
- Transform: TranslateY(-4px) (lifts up slightly)

**Transition:**
- Duration: 0.3s (300ms)
- Easing: Ease-out
- Delay: 0s

### Link Hover Effect

**Default State:**
- Color: #007AFF (link color)
- Text decoration: None
- Opacity: 1.0

**Hover State:**
- Color: #0056CC (darker blue)
- Text decoration: Underline (optional)
- Opacity: 0.9 (slightly faded)

**Transition:**
- Duration: 0.15s (150ms)
- Easing: Ease-in-out
- Delay: 0s

### Icon Hover Effect

**Default State:**
- Scale: 1.0
- Opacity: 0.7 (slightly faded)

**Hover State:**
- Scale: 1.1 (10% larger)
- Opacity: 1.0 (fully opaque)

**Transition:**
- Duration: 0.2s
- Easing: Ease-out
- Delay: 0s

### Common Hover Values

**Scale:**
- Subtle: 1.02 (2% larger)
- Medium: 1.05 (5% larger)
- Dramatic: 1.1 (10% larger)

**Duration:**
- Quick: 0.15s (150ms)
- Standard: 0.2s to 0.3s (200-300ms)
- Slow: 0.4s (400ms) - use sparingly

**Easing:**
- Ease-out: Most common (starts fast, ends slow)
- Ease-in-out: Smooth both ways
- Spring: Bouncy, playful feel

## Source Reference

This pattern comes from:
- Transcript: "Using Hover and Press Effects in Framer (Animation Lesson 2).txt"
- Key concepts:
  - Hover effects give visitors tangible feedback
  - Makes it super clear if something is clickable
  - Common pattern: slight scale-up (1.0 to 1.02) or subtle background color change
  - Hover happens as soon as cursor mouses over element
  - Returns to normal when cursor leaves

- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - All interactive elements must have defined hover state
  - Common pattern: slight scale-up (1.0 to 1.02) or subtle background color change
  - Resource cards must include distinct hover state

## Common Variations

### 1. Scale-Only Hover

**What it is:** Element only gets bigger on hover, no color change.

**When to use:** For subtle, minimal designs.

**Specifications:**
- Scale: 1.02 to 1.05
- No color change
- Duration: 0.2s
- Easing: Ease-out

### 2. Color-Only Hover

**What it is:** Element changes color on hover, no size change.

**When to use:** When you want feedback without movement.

**Specifications:**
- Background: 10-20% darker/lighter
- No scale change
- Duration: 0.2s
- Easing: Ease-in-out

### 3. Lift Hover (Card)

**What it is:** Element scales up and moves up slightly, like lifting off the page.

**When to use:** For cards, product items, project showcases.

**Specifications:**
- Scale: 1.05
- Transform: TranslateY(-8px)
- Shadow: Increases (more pronounced)
- Duration: 0.3s
- Easing: Ease-out

### 4. Rotate Hover

**What it is:** Element rotates slightly on hover (playful effect).

**When to use:** For playful, creative designs (use sparingly).

**Specifications:**
- Rotate: 5° to 10°
- Scale: Optional (1.02)
- Duration: 0.3s
- Easing: Spring (for bouncy feel)

### 5. Background Fill Hover

**What it is:** Transparent element gets filled background on hover.

**When to use:** For outlined buttons or ghost buttons.

**Specifications:**
- Background: Transparent → Solid color
- Text color: May invert (dark text becomes light)
- Duration: 0.2s
- Easing: Ease-out

## Things to Avoid

### 1. Too Dramatic

**Problem:** Hover effect is too extreme (scale 1.5, huge color change).

**Why it's bad:** Distracting, feels unstable, can cause layout shifts.

**Fix:** Keep changes subtle. Scale 1.02-1.05 max. Color changes should be 10-20%.

### 2. Too Slow

**Problem:** Hover effect takes 1+ seconds to complete.

**Why it's bad:** Feels laggy, unresponsive, users think it's broken.

**Fix:** Keep duration under 0.3s. 0.2s is ideal for most cases.

### 3. No Hover on Clickable Elements

**Problem:** Buttons and links have no hover state.

**Why it's bad:** Users can't tell what's clickable, poor user experience.

**Fix:** Always add hover states to interactive elements.

### 4. Inconsistent Hover Effects

**Problem:** Different elements have completely different hover behaviors.

**Why it's bad:** Feels unprofessional, inconsistent, confusing.

**Fix:** Use consistent hover patterns across similar elements (all buttons same, all cards same).

### 5. Hover on Mobile

**Problem:** Trying to use hover effects on touch devices.

**Why it's bad:** Mobile devices don't have hover (no cursor). Effects won't work.

**Fix:** Hover effects are desktop-only. Use press/tap effects for mobile instead.

## Related Patterns

- [Press Effects](#) - Similar to hover but for click/tap
- [Micro-Interactions](./micro-interactions.md) - Hover is a type of micro-interaction
- [Buttons](../components/buttons.md) - Buttons should have hover states
- [Cards](../components/cards.md) - Cards should have hover states
- [Transitions and Easing](./scroll-animations.md) - Understanding how hover transitions work

---

**Next:** Learn about [Scroll Animations](./scroll-animations.md) for revealing content as users scroll.

