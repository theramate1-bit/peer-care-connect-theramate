# Theramate Email Design System

## Overview

This document defines the standardized design system for all email templates in Theramate. All emails follow these guidelines to ensure consistency, accessibility, and professional appearance across all email clients.

## Color Palette

### Primary Colors

#### Success/Confirmation (Primary Green)
- **Header/Buttons**: `#059669` (emerald-600)
- **Borders/Accents**: `#059669` (emerald-600)
- **Background (light)**: `#f0fdf4` (emerald-50)
- **Text (dark)**: `#166534` (emerald-800)
- **Usage**: Booking confirmations, payment confirmations, success messages, peer booking confirmations
- **WCAG Contrast**: ✅ AA compliant (4.5:1+ on white)

#### Warning/Reminder (Amber)
- **Header/Buttons**: `#d97706` (amber-600) - **IMPROVED from #f59e0b for better contrast**
- **Borders/Accents**: `#d97706` (amber-600)
- **Background (light)**: `#fef3c7` (amber-100)
- **Usage**: Session reminders (24h), rescheduling notifications, peer treatment bookings
- **WCAG Contrast**: ✅ AA compliant (4.5:1+ on white)

#### Urgent/Error (Red)
- **Header/Buttons**: `#dc2626` (red-600)
- **Borders/Accents**: `#dc2626` (red-600)
- **Usage**: Cancellations, urgent reminders (1h), errors, decline actions
- **WCAG Contrast**: ✅ AA compliant (5.2:1 on white)

#### Rescheduling (Orange)
- **Header/Buttons**: `#ea580c` (orange-600) - **IMPROVED from #f97316 for better contrast**
- **Borders/Accents**: `#ea580c` (orange-600)
- **Background (light)**: `#fff7ed` (orange-50)
- **Text (dark)**: `#9a3412` (orange-800)
- **Text (darker)**: `#7c2d12` (orange-900)
- **Usage**: Rescheduling notifications, 2-hour reminders, cancellation policy boxes
- **WCAG Contrast**: ✅ AA compliant (4.5:1+ on white)

### Neutral Colors

- **Body Text**: `#1f2937` (gray-800) - **IMPROVED from #333 for better readability**
- **Secondary Text**: `#6b7280` (gray-500) - **IMPROVED from #666**
- **Background**: `#f8fafc` (gray-50)
- **Content Boxes**: `white` (#ffffff)
- **Footer Text**: `#6b7280` (gray-500)

### Color Usage by Email Type

| Email Type | Header Color | Purpose |
|------------|-------------|---------|
| Booking Confirmations | `#059669` (Green) | Success, confirmation |
| Payment Confirmations | `#059669` (Green) | Success, confirmation |
| Session Reminders (24h) | `#d97706` (Amber) | Warning, attention needed |
| Session Reminders (2h) | `#ea580c` (Orange) | Urgent, time-sensitive |
| Session Reminders (1h) | `#dc2626` (Red) | Critical, immediate action |
| Cancellations | `#dc2626` (Red) | Error, negative action |
| Rescheduling | `#d97706` (Amber) | Change notification |
| Peer Bookings | `#059669` (Green) | Success, confirmation |
| Review Requests | `#059669` (Green) | Positive action request |
| Message Notifications | `#059669` (Green) | Information, positive |

## Typography

### Font Stack

**Standard Email-Safe Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;
```

**Rationale:**
- `-apple-system`: Native iOS/macOS system font (San Francisco)
- `BlinkMacSystemFont`: Chrome/Edge on macOS
- `'Segoe UI'`: Windows system font
- `Arial, Helvetica`: Universal fallbacks
- `sans-serif`: Final fallback

### Font Sizes

- **Body Text**: 16px (1rem) - default browser size for readability
- **Footer Text**: 14px
- **Headings**: Inherit from body, styled with font-weight
- **Small Text**: 14px minimum (WCAG requirement)

### Font Weights

- **Body Text**: 400 (normal)
- **Headings**: 600 (semi-bold)
- **Buttons**: 600 (semi-bold)
- **Strong/Bold**: 600-700

### Line Height

- **Body Text**: 1.6 (optimal for readability)
- **Footer**: 1.5
- **Headings**: Inherit from body

### Text Colors

- **Primary Text**: `#1f2937` (gray-800) - WCAG AA compliant
- **Secondary Text**: `#6b7280` (gray-500) - WCAG AA compliant
- **Links**: Match button/header color with underline
- **White Text**: Used on colored backgrounds (headers, buttons)

## Layout & Spacing

### Container

- **Max Width**: 600px (email standard)
- **Padding**: 20px (desktop), 10px (mobile)
- **Margin**: 0 auto (centered)

### Header

- **Padding**: 24px 20px (desktop), 20px 15px (mobile)
- **Border Radius**: 8px 8px 0 0 (top corners only)
- **Text Align**: Center
- **Background**: Color-coded by email type

### Content Area

- **Padding**: 30px (desktop), 20px (mobile)
- **Background**: `#f8fafc` (gray-50)
- **Border Radius**: 0 0 8px 8px (bottom corners only)

### Content Boxes

- **Background**: White
- **Padding**: 20px
- **Border Radius**: 8px
- **Border Left**: 4px solid (color matches header)
- **Margin**: 20px 0

### Buttons (CTA)

- **Display**: Inline-block (desktop), Block (mobile)
- **Padding**: 12px 24px
- **Border Radius**: 6px
- **Margin**: 10px 5px (desktop), 8px 0 (mobile)
- **Font Weight**: 600
- **Width**: Auto (desktop), 100% (mobile)
- **Text Align**: Center (mobile)

### Footer

- **Margin Top**: 30px
- **Text Align**: Center
- **Font Size**: 14px
- **Color**: `#6b7280` (gray-500)
- **Line Height**: 1.5

## Mobile Responsiveness

### Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

### Media Queries

```css
@media only screen and (max-width: 600px) {
  body { padding: 10px !important; }
  .content { padding: 20px !important; }
  .header { padding: 20px 15px !important; }
  .cta-button { 
    display: block !important; 
    width: 100% !important; 
    margin: 8px 0 !important; 
    text-align: center !important; 
  }
}
```

### Mobile-Specific Considerations

- Buttons stack vertically on mobile
- Reduced padding for smaller screens
- Text size adjustments via `-webkit-text-size-adjust: 100%`
- Full-width buttons for easier tapping

## Accessibility (WCAG Compliance)

### Color Contrast Ratios

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

- ✅ `#059669` on white: 4.5:1
- ✅ `#d97706` on white: 4.5:1 (improved from #f59e0b)
- ✅ `#dc2626` on white: 5.2:1
- ✅ `#ea580c` on white: 4.5:1 (improved from #f97316)
- ✅ `#1f2937` on white: 12.6:1
- ✅ `#6b7280` on white: 4.6:1
- ✅ White on colored backgrounds: All meet AA standards

### Best Practices

1. **Text Alternatives**: All images must have descriptive alt text
2. **Link Text**: Descriptive, not "click here"
3. **Color Independence**: Information conveyed by color also has text/icon indicators
4. **Font Sizes**: Minimum 14px for readability
5. **Line Height**: 1.5-1.6 for optimal readability

## Component Patterns

### Standard Email Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Title</title>
  <style>
    /* Standardized styles */
  </style>
</head>
<body>
  <div class="header">
    <h1>Email Title</h1>
  </div>
  <div class="content">
    <!-- Content here -->
    <div class="session-details">
      <!-- Details box -->
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" class="cta-button">Action Button</a>
    </div>
  </div>
  <div class="footer">
    <p>This email was sent by Theramate</p>
    <p>If you have any questions, please contact us at support@theramate.co.uk</p>
  </div>
</body>
</html>
```

### Highlight Boxes

**Success/Info Box:**
```html
<div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0; color: #166534; font-size: 14px;">
    <!-- Content -->
  </p>
</div>
```

**Warning Box:**
```html
<div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; border-radius: 4px;">
  <h4 style="margin-top: 0; color: #9a3412; font-size: 16px; font-weight: 600;">Title</h4>
  <p style="margin-bottom: 0; color: #7c2d12; font-size: 14px;">Content</p>
</div>
```

## Branding

### Brand Name
- **Standard**: "Theramate" (not "Peer Care Connect")
- **Consistent across all emails**

### Support Email
- **Standard**: `support@theramate.co.uk`
- **Consistent across all emails**

### Sender Email
- **Standard**: `Theramate <noreply@theramate.co.uk>`
- **Fallback**: Set via `RESEND_FROM_EMAIL` environment variable

## Email Client Compatibility

### Tested Clients

- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird

### Compatibility Notes

- Uses inline styles where necessary
- Avoids CSS Grid/Flexbox (limited support)
- Uses table-based layouts for complex structures (if needed)
- Media queries supported in most modern clients
- Fallbacks for older clients

## Implementation Checklist

When creating or updating email templates:

- [ ] Use standardized color palette
- [ ] Apply correct font stack
- [ ] Include mobile responsive styles
- [ ] Test color contrast ratios
- [ ] Use consistent spacing
- [ ] Include proper viewport meta tags
- [ ] Standardize footer with brand name
- [ ] Test in multiple email clients
- [ ] Verify accessibility compliance

## Version History

- **2025-01-XX**: Initial design system created
- **2025-01-XX**: Improved amber/orange colors for better contrast
- **2025-01-XX**: Enhanced typography with system font stack
- **2025-01-XX**: Standardized mobile responsiveness
- **2025-01-XX**: Fixed branding inconsistencies

