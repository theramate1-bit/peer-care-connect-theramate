# CSS Scan Report: onghost.com

**Date:** November 10, 2025  
**URL:** https://onghost.com/

## Summary

The website uses **11 inline stylesheets** (no external CSS files via `<link>` tags). All CSS is embedded directly in `<style>` tags within the HTML document.

## Stylesheet Overview

| Index | Type | Rules | Size (chars) |
|-------|------|-------|--------------|
| 0 | Inline | 357 | 101,326 |
| 1 | Inline | 440 | 164,238 |
| 2 | Inline | 120 | 0 |
| 3 | Inline | 7 | 3,568 |
| 4 | Inline | 5 | 703 |
| 5 | Inline | 1 | 250 |
| 6 | Inline | 4 | 1,034 |
| 7 | Inline | 48 | 0 |
| 8 | Inline | 1 | 97 |
| 9 | Inline | 1 | 96 |
| 10 | Inline | 5 | 370 |

**Total CSS Rules:** 989 rules across 11 stylesheets  
**Total CSS Size:** ~271,686 characters (~265 KB)

## Font Families Used

The site uses multiple Google Fonts and custom fonts:

1. **Aldrich** - Regular (400)
2. **Bricolage Grotesque** - Regular (400)
3. **DM Sans** - Regular (400), Bold (700), Italic (400)
4. **Instrument Sans** - Regular (400), Medium (500), Semi-bold (600), Bold (700), Italic variants
5. **Manrope** - Semi-bold (600)
6. **Poppins** - Regular (400), Bold (700), Italic variants
7. **SF Pro Display** - Regular (400), Medium (500), Bold (700) - Custom fonts from Framer
8. **Inter Display** - Medium (500), Semi-bold (600), Bold (700), Italic variants - Custom fonts from Framer
9. **Inter** - Regular (400), Semi-bold (600) - Custom fonts from Framer

## Key Observations

1. **No External Stylesheets**: All CSS is inline, which suggests the site may be using a framework like Framer or a similar tool that bundles CSS.

2. **Large Inline Stylesheets**: The two largest stylesheets (indices 0 and 1) contain 265,564 characters combined, suggesting heavy use of CSS-in-JS or a build tool that inlines styles.

3. **Font Loading Strategy**: Uses `font-display: swap` for all fonts, which improves perceived performance.

4. **Custom Font Sources**: Many fonts are loaded from `framerusercontent.com`, indicating the site is built with Framer.

5. **No External Link Tags**: No `<link rel="stylesheet">` tags found, meaning all styles are embedded.

## CSS Structure

The CSS includes:
- Extensive `@font-face` declarations (100+ font variants)
- Standard CSS rules for layout, typography, colors, and animations
- Media queries for responsive design
- CSS custom properties (variables) using Framer's token system (e.g., `--token-*`)
- Framer-specific class naming convention (`.framer-*` classes)

### Example CSS Rules

The site uses Framer's CSS-in-JS approach with generated class names. Here are some examples:

```css
.framer-acIhc.framer-ooegvo {
  background-color: var(--token-0b85bf41-9970-464d-96f4-152f236b9294,#f1f0ee);
  flex-flow: column;
  place-content: center flex-start;
  align-items: center;
  gap: 0px;
  width: 1200px;
  height: min-content;
  padding: 100px 0px 0px;
  display: flex;
  position: relative;
  overflow: hidden;
}

.framer-acIhc .framer-1bcx7jx-container {
  flex: 0 0 auto;
  width: 100%;
  height: 638px;
  position: relative;
}

.framer-acIhc .framer-mdzve7 {
  will-change: var(--framer-will-change-override,transform);
  border-radius: 20px;
  flex: 0 0 auto;
  width: 100%;
  max-width: 500px;
  height: 245px;
  position: relative;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0.602187px 1.56569px -1px,
              rgba(0, 0, 0, 0.14) 0px 2.28853px 5.95019px -2px,
              rgba(0, 0, 0, 0.1) 0px 10px 26px -3px;
}
```

**Key CSS Features:**
- Flexbox-based layouts (`display: flex`, `flex-flow`, `place-content`)
- CSS custom properties for theming (`--token-*` variables)
- Modern CSS features (`aspect-ratio`, `will-change`, `mask`)
- Box shadows for depth and elevation
- Responsive design patterns

## Recommendations

1. **Consider External Stylesheets**: For better caching, consider extracting some CSS into external files.

2. **Font Optimization**: The site loads many font variants. Consider reducing the number of font weights/styles if not all are used.

3. **CSS Minification**: Ensure CSS is minified in production to reduce file size.

4. **Critical CSS**: Consider extracting above-the-fold critical CSS for faster initial render.

## Full CSS Data

The complete extracted CSS data has been saved to:
`c:\Users\rayma\.cursor\projects\c-Users-rayma-Desktop-New-folder\agent-tools\e1b52fcb-16de-47b7-a9db-dffbcd5fa7d9.txt`

This file contains all CSS rules, font declarations, and inline styles extracted from the page.

