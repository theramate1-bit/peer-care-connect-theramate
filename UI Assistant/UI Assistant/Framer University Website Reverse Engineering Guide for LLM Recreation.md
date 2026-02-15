# Framer University Website Reverse Engineering Guide for LLM Recreation

**Goal:** To provide a comprehensive, structured guide for a Large Language Model (LLM) to recreate the Framer University website (`https://framer.university`) with 1:1 fidelity, based on the design patterns and techniques identified from the @learnframer X (Twitter) profile and the live site analysis.

**Source of Analysis:** @learnframer X (Twitter) profile and the linked Framer University website.

---

## I. Core Aesthetic and Design Specifications

The target design is a **modern, high-contrast, dark-themed website** that heavily utilizes Framer's advanced interaction features, particularly scroll effects and component-based architecture.

### A. Color Palette and Typography

The LLM must adhere to the following visual specifications to match the aesthetic:

| Element | Specification | Rationale |
| :--- | :--- | :--- |
| **Background** | Near-black (`#000000` or a very dark gray, e.g., `#0A0A0A`) | Establishes the professional, dark-mode aesthetic. |
| **Primary Text** | Pure White (`#FFFFFF`) | Ensures high contrast and readability. |
| **Accent Color** | Vibrant Blue (e.g., `#007AFF` or similar) | Used for primary call-to-action buttons, links, and interactive elements. |
| **Font Family** | Modern, clean **Sans-Serif** (e.g., Inter, Satoshi, or a suitable system-default equivalent). | Maintains a contemporary, professional feel. |
| **Headings (H1, H2)** | Large, bold weight. H1 should be the most prominent element on the page. | Creates visual impact and clear hierarchy. |

### B. Layout and Structure Directives

The layout is built on a modular, full-width system with a consistent vertical rhythm.

| Pattern | Implementation Detail | LLM Instruction |
| :--- | :--- | :--- |
| **Section Spacing** | Generous vertical padding between main content blocks. | Use consistent vertical spacing (e.g., 120px top/bottom padding) for all major sections. |
| **Navigation Bar** | **Sticky** position at the top of the viewport. | Implement a fixed/sticky header component that remains visible on scroll. |
| **Content Grid** | Responsive grid system for displaying resources and blog posts. | Utilize Framer's **Grid** or **Stack** components to create a 3-column layout on desktop, collapsing gracefully on smaller breakpoints. |
| **Visual Hierarchy** | Prominent use of large, full-width visual elements (videos, images) to break up text sections. | Ensure media elements are integrated seamlessly and respect the dark theme. |

---

## II. Key Interaction and Animation Techniques

The website's distinctiveness comes from its subtle yet advanced Framer-native interactions, as highlighted in the analysis of the X profile's content.

### A. Scroll Effects (Parallax and Fade)

The LLM must implement subtle scroll-triggered animations to bring the design to life:

1.  **Subtle Parallax:** Apply a minor **Y-axis transformation** (`Scroll Effect`) to large background images or video elements, causing them to move slightly slower than the foreground content.
2.  **Fade-In on View:** Apply an **Opacity** `Scroll Effect` to content blocks (e.g., section headings, resource cards) so they fade from 0% to 100% opacity as they enter the viewport. This should be a smooth, short transition.

### B. Component States and Micro-Interactions

1.  **Hover States:** All interactive elements (buttons, links, resource cards) must have a defined **Hover State**. A common pattern is a slight scale-up (1.0 to 1.02) or a subtle background color change.
2.  **Video Integration:** Videos (e.g., the Hero section intro) should be embedded using Framer's native video component for optimal performance and responsiveness.
3.  **Accordion Component:** The "Frequently asked questions" section requires an **Accordion Component** where clicking the question expands to reveal the answer.

---

## III. Essential Component Breakdown for LLM

The LLM should be instructed to create the following reusable components, which form the building blocks of the site:

| Component Name | Key Elements | Functionality |
| :--- | :--- | :--- |
| **1. Primary Navigation** | Logo, Text Links (`Lessons`, `Resources`, `Blog`, etc.), Primary Button (`Join waitlist`), Search Icon. | Sticky position, responsive collapse for mobile (e.g., a hamburger menu). |
| **2. Hero Section** | H1 Title, Descriptive Text, Video/Image Placeholder, Primary CTA Button. | Large, centered content with a full-width background video/image. |
| **3. Testimonial Card** | Quote text, Author Name, Author Title/Handle, Profile Picture Placeholder. | Minimalist, dark-themed card design. Used in a horizontal or vertical stack. |
| **4. Resource Card** | Preview Image/Video Placeholder, Title, "Quick preview" button. | Used in the responsive 3-column grid. Must include a distinct **Hover State**. |
| **5. FAQ Accordion** | Question (Header), Answer (Collapsible Content). | Toggles visibility of the answer content on click. |

---

## IV. Conclusion for LLM Prompting

The LLM should use this document as a blueprint. The most critical instruction is to **prioritize Framer-native features** for layout (Stacks, Grids) and interaction (Scroll Effects, Hover States) to ensure the recreation is technically accurate and not just a static visual copy. The LLM should be prompted to generate the Framer project structure and the code overrides for any complex interactions not covered by standard components.

---
*End of Document*
