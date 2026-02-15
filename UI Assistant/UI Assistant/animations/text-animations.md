# Text Animations

## What is this?

Text animations are effects applied to text content - words, letters, or lines can fade in, slide in, or animate character by character to create engaging, dynamic typography.

**What it looks like:** Text that appears letter by letter, words that fade in one at a time, or headings that slide in with a stagger effect.

**When to use it:** Use for hero headings, important announcements, or any text you want to draw attention to. Adds polish and emphasis.

## Why use this?

Text animations solve attention and engagement problems:

1. **Emphasis:** Draws attention to important text
2. **Engagement:** Makes text more interesting and dynamic
3. **Polish:** Adds professional, thoughtful feel
4. **Storytelling:** Can create narrative flow with sequential reveals

**User Benefit:** Important text stands out more, creating better hierarchy and engagement.

**Design Principle:** Follows visual hierarchy - animated text naturally draws the eye and creates emphasis.

## Step-by-Step Implementation

### 1. Choose Animation Type

- Per character: Each letter animates individually
- Per word: Each word animates individually
- Per line: Each line animates individually
- Entire element: Whole text block animates together

### 2. Set Initial State

- Opacity: 0 (invisible)
- Transform: Optional offset (translateY, translateX)
- Scale: Optional (0.8 to 0.9)

### 3. Set Final State

- Opacity: 1 (visible)
- Transform: 0 (normal position)
- Scale: 1.0 (normal size)

### 4. Set Stagger

- Delay between each character/word/line: 0.05s to 0.1s
- Creates cascading effect

### 5. Set Transition

- Duration: 0.3s to 0.5s per element
- Easing: Ease-out

## Exact Specifications

### Character-by-Character Animation

**Each Character:**
- Opacity: 0 → 1
- Duration: 0.3s
- Easing: Ease-out
- Stagger: 0.05s (50ms between each character)

### Word-by-Word Animation

**Each Word:**
- Opacity: 0 → 1
- Transform: TranslateY(20px) → 0
- Duration: 0.4s
- Easing: Ease-out
- Stagger: 0.1s (100ms between each word)

### Line-by-Line Animation

**Each Line:**
- Opacity: 0 → 1
- Transform: TranslateY(30px) → 0
- Duration: 0.5s
- Easing: Ease-out
- Stagger: 0.15s (150ms between each line)

## Source Reference

This pattern comes from:
- Transcript: "Animating text in Framer (Animation Lesson 17).txt"
- Key concepts: Text can animate per character, word, line, or element for emphasis and engagement

## Common Variations

1. **Fade In:** Simple opacity animation
2. **Slide Up:** Text slides up while fading in
3. **Typewriter:** Characters appear one by one (like typing)
4. **Stagger:** Words/characters animate in sequence

## Things to Avoid

1. **Too Slow:** Keep stagger under 0.1s per element
2. **Too Fast:** At least 0.05s between elements
3. **Overuse:** Don't animate every text element
4. **Distracting:** Keep it subtle for body text

## Related Patterns

- [Scroll Animations](./scroll-animations.md) - Text often animates on scroll
- [Hero Sections](../layouts/hero-sections.md) - Hero headings use text animations

---

**Next:** Explore [Component Patterns](../components/) to learn about reusable UI elements.

