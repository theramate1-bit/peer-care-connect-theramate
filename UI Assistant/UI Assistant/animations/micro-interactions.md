# Micro-Interactions

## What is this?

Micro-interactions are small, subtle animations that respond to user actions. They're the tiny details that make interfaces feel alive and responsive - like a button that slightly bounces when clicked, or a checkbox that smoothly checks.

**What it looks like:** Small animations that happen in response to user actions: button presses, form submissions, toggles, loading states, success messages.

**When to use it:** Use micro-interactions for any user action that needs feedback: button clicks, form inputs, toggles, loading states, success/error messages.

## Why use this?

Micro-interactions solve feedback problems:

1. **Confirmation:** Users know their action worked
2. **Delight:** Small touches make experiences enjoyable
3. **Guidance:** Subtle animations guide users
4. **Polish:** Makes interfaces feel professional and thoughtful

**User Benefit:** Users get immediate, clear feedback that their actions are recognized and processed.

**Design Principle:** Follows the feedback principle - every action should have a response. Micro-interactions provide that response.

## Step-by-Step Implementation

### 1. Identify the Action

What user action needs feedback? (click, type, toggle, submit)

### 2. Design the Response

What should happen? (scale, color change, icon change, movement)

### 3. Set Timing

How fast should it be? (0.1s to 0.3s for micro-interactions)

### 4. Test Feel

Does it feel responsive and natural?

## Exact Specifications

### Button Press

**Press State:**
- Scale: 1.0 → 0.95 (slightly smaller, like being pressed)
- Duration: 0.1s
- Easing: Ease-out

**Release State:**
- Scale: 0.95 → 1.0 (returns to normal)
- Duration: 0.15s
- Easing: Ease-out

### Checkbox Toggle

**Unchecked → Checked:**
- Scale: 0 → 1 (checkmark appears)
- Duration: 0.2s
- Easing: Spring (slight bounce)

### Loading Spinner

**Animation:**
- Rotate: 0° → 360° (continuous)
- Duration: 1s per rotation
- Easing: Linear
- Repeat: Infinite

### Success Message

**Appear:**
- Opacity: 0 → 1
- Transform: TranslateY(-10px) → 0
- Duration: 0.3s
- Easing: Ease-out

## Source Reference

This pattern comes from:
- Transcript: "Using Hover and Press Effects in Framer (Animation Lesson 2).txt"
- Key concepts: Press effects give feedback when clicking, small touches make big difference

## Common Variations

1. **Button Press:** Scale down on press
2. **Toggle Switch:** Smooth slide animation
3. **Loading State:** Spinner or progress bar
4. **Success/Error:** Icon appears with animation
5. **Input Focus:** Border color change, slight scale

## Things to Avoid

1. **Too Slow:** Keep under 0.3s
2. **Too Dramatic:** Keep changes subtle
3. **Missing Feedback:** Every action needs response
4. **Inconsistent:** Use same patterns across similar actions

## Related Patterns

- [Hover Effects](./hover-effects.md) - Similar feedback principles
- [Buttons](../components/buttons.md) - Buttons use micro-interactions
- [Forms](../components/forms.md) - Forms use micro-interactions

---

**Next:** Learn about [Text Animations](./text-animations.md) for animating text content.

