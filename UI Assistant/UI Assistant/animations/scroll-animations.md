# Scroll Animations

## What is this?

Scroll animations are effects that trigger when users scroll the page. Content fades in, slides in, or scales up as it comes into view, creating a sense of discovery and guiding users through your content.

**What it looks like:** As you scroll down, text fades in, images slide in from the sides, cards scale up. Everything feels like it's being revealed as you explore.

**When to use it:** Use scroll animations for content below the initial view (below the fold). They add polish and help guide users through long pages without being distracting.

## Why use this?

Scroll animations solve several problems:

1. **Progressive Disclosure:** Reveals content as users are ready to see it, not all at once
2. **Focus:** Draws attention to content as it enters the viewport
3. **Engagement:** Makes scrolling feel more dynamic and interesting
4. **Pacing:** Controls the rhythm of how users experience your content

**User Benefit:** Users are naturally guided through content, important information is highlighted as it appears, and the experience feels more polished and intentional.

**Design Principle:** Follows progressive disclosure - show content when it's needed, reveal information gradually. Also follows the principle that animations should add clarity, not just decoration.

## Step-by-Step Implementation

### 1. Identify the Element

Choose the element you want to animate (heading, card, image, section).

### 2. Set Initial State

Define how the element looks before animation:
- Opacity: 0 (invisible)
- Scale: 0.7 to 0.9 (smaller)
- Transform: Offset position (e.g., -50px on Y-axis, or -150px on X-axis)

### 3. Set Final State

Define how the element looks after animation:
- Opacity: 1 (fully visible)
- Scale: 1.0 (normal size)
- Transform: 0 (normal position)

### 4. Set Trigger Point

Define when animation starts:
- **Layer in view:** When element itself reaches viewport
  - Top reaches bottom: Animation starts early
  - Center reaches bottom: Balanced (recommended)
  - Bottom reaches bottom: Animation starts late
- **Section in view:** When a section reaches viewport (for multiple elements)
- **On scroll:** Triggers based on scroll direction (up/down)

### 5. Set Transition

Define how the animation happens:
- Duration: 0.6s to 2s (longer for dramatic effect)
- Easing: Ease-out (most common) or spring
- Delay: 0s (or small delay for stagger effects)

### 6. Choose Replay Behavior

Decide if animation should replay:
- **No replay:** Animation plays once (recommended for most cases)
- **Replay:** Animation plays every time element enters view (can be distracting)

## Exact Specifications

### Fade-In on Scroll

**Initial State:**
- Opacity: 0
- Scale: 1.0 (no scale change)
- Transform: None

**Final State:**
- Opacity: 1
- Scale: 1.0
- Transform: None

**Trigger:**
- Type: Layer in view
- Position: Center reaches bottom of viewport

**Transition:**
- Duration: 0.6s
- Easing: Ease-out
- Delay: 0s

### Scale-In on Scroll

**Initial State:**
- Opacity: 0
- Scale: 0.7 (70% of original size)
- Transform: None

**Final State:**
- Opacity: 1
- Scale: 1.0 (normal size)
- Transform: None

**Trigger:**
- Type: Layer in view
- Position: Center reaches bottom of viewport

**Transition:**
- Duration: 0.8s
- Easing: Ease-out
- Delay: 0s

### Slide-In from Left

**Initial State:**
- Opacity: 0
- Scale: 1.0
- Transform: TranslateX(-150px) (150px to the left)

**Final State:**
- Opacity: 1
- Scale: 1.0
- Transform: TranslateX(0) (normal position)

**Trigger:**
- Type: Section in view (for multiple elements)
- Position: Top of section reaches top of viewport

**Transition:**
- Duration: 0.8s
- Easing: Ease-out
- Delay: 0s

### Slide-In from Right

**Initial State:**
- Opacity: 0
- Scale: 1.0
- Transform: TranslateX(150px) (150px to the right)

**Final State:**
- Opacity: 1
- Scale: 1.0
- Transform: TranslateX(0) (normal position)

**Trigger:**
- Type: Section in view
- Position: Top of section reaches top of viewport

**Transition:**
- Duration: 0.8s
- Easing: Ease-out
- Delay: 0s

### Combined Fade + Scale + Slide

**Initial State:**
- Opacity: 0
- Scale: 0.7
- Transform: TranslateY(40px) (40px down)

**Final State:**
- Opacity: 1
- Scale: 1.0
- Transform: TranslateY(0)

**Trigger:**
- Type: Layer in view
- Position: Center reaches bottom

**Transition:**
- Duration: 1s
- Easing: Ease-out
- Delay: 0s

### Staggered Scroll Animation (Multiple Elements)

**For first element:**
- Same as above
- Delay: 0s

**For second element:**
- Same animation
- Delay: 0.1s (100ms after first)

**For third element:**
- Same animation
- Delay: 0.2s (200ms after first)

**Pattern:** Each element delayed by 0.1s from previous.

## Source Reference

This pattern comes from:
- Transcript: "Triggering animations on scroll in Framer (Animation Lesson 7).txt"
- Key concepts:
  - Trigger animations when visitor scrolls to certain point
  - Layer in view: Animation triggers when element reaches viewport
  - Section in view: Multiple elements animate together when section reaches viewport
  - On scroll: Triggers based on scroll direction (up/down)
  - Fade-in on view: Apply opacity scroll effect so content fades from 0% to 100% as it enters viewport
  - Smooth, short transition

- Transcript: "Framer University Website Reverse Engineering Guide for LLM Recreation.md"
- Key concepts:
  - Subtle scroll-triggered animations bring design to life
  - Fade-in on view: Content blocks fade from 0% to 100% opacity as they enter viewport
  - Should be smooth, short transition
  - Apply to section headings, resource cards

- Transcript: "Generalized Framer Design Patterns for LLM Recreation (Portfolio Analysis).md"
- Key concepts:
  - Scroll effects add depth and polish
  - Focus on micro-interactions and scroll effects without distracting from content
  - Subtle to complex motion design, often scroll-triggered

## Common Variations

### 1. Fade-In Only

**What it is:** Element simply fades in, no movement or scaling.

**When to use:** For subtle, minimal animations. Best for text content.

**Specifications:**
- Opacity: 0 → 1
- No scale or transform
- Duration: 0.6s
- Easing: Ease-out

### 2. Scale-In

**What it is:** Element starts small and grows to normal size while fading in.

**When to use:** For cards, images, featured content. Creates emphasis.

**Specifications:**
- Opacity: 0 → 1
- Scale: 0.7 → 1.0
- Duration: 0.8s
- Easing: Ease-out

### 3. Slide-In from Side

**What it is:** Element slides in from left or right while fading in.

**When to use:** For side-by-side content, alternating left/right creates rhythm.

**Specifications:**
- Opacity: 0 → 1
- Transform: TranslateX(-150px) → 0 (left) or TranslateX(150px) → 0 (right)
- Duration: 0.8s
- Easing: Ease-out

### 4. Slide-Up

**What it is:** Element slides up from below while fading in.

**When to use:** Most common pattern, feels natural (content rising into view).

**Specifications:**
- Opacity: 0 → 1
- Transform: TranslateY(40px) → 0
- Duration: 0.8s
- Easing: Ease-out

### 5. Staggered Animation

**What it is:** Multiple elements animate in sequence, one after another.

**When to use:** For lists, card grids, multiple items. Creates rhythm.

**Specifications:**
- Same animation for all elements
- Delay: 0.05s to 0.1s between each element
- Creates cascading effect

## Things to Avoid

### 1. Too Fast

**Problem:** Animation completes in 0.2s or less.

**Why it's bad:** Too quick to notice, feels abrupt, users might miss it.

**Fix:** Use 0.6s to 1s duration for scroll animations. They should be noticeable but not slow.

### 2. Too Slow

**Problem:** Animation takes 3+ seconds.

**Why it's bad:** Users scroll past before animation finishes, feels laggy.

**Fix:** Keep under 2s. 0.8s to 1s is ideal for most scroll animations.

### 3. Replaying Constantly

**Problem:** Animation replays every time element enters view (replay enabled).

**Why it's bad:** Distracting, annoying, can cause performance issues.

**Fix:** Disable replay for most scroll animations. Let them play once.

### 4. Too Dramatic

**Problem:** Huge scale changes (0.3 to 1.0) or large movements (500px).

**Why it's bad:** Distracting, feels unstable, can cause layout shifts.

**Fix:** Keep changes subtle. Scale 0.7-0.9 to 1.0. Movements 40-150px max.

### 5. Animating Everything

**Problem:** Every single element has a scroll animation.

**Why it's bad:** Overwhelming, distracting, slows down page, feels chaotic.

**Fix:** Animate key elements only: headings, cards, featured content. Not every paragraph or small element.

### 6. Poor Trigger Timing

**Problem:** Animation starts too early (element not visible) or too late (user already scrolled past).

**Why it's bad:** Users miss the animation or see incomplete animation.

**Fix:** Use "center reaches bottom" trigger for balanced timing. Test and adjust.

## Related Patterns

- [Hover Effects](./hover-effects.md) - Similar transition principles
- [Page Transitions](./page-transitions.md) - Transitions between pages
- [Text Animations](./text-animations.md) - Animating text on scroll
- [Transitions and Easing](#) - Understanding animation timing
- [Visual Hierarchy](../principles/visual-hierarchy.md) - Scroll animations create hierarchy

---

**Next:** Learn about [Page Transitions](./page-transitions.md) for smooth navigation between pages.

