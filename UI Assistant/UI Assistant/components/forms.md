# Forms

## What is this?

Forms are collections of input fields where users enter information: text inputs, checkboxes, radio buttons, dropdowns, and submit buttons.

**What it looks like:** A series of labeled input fields stacked vertically, with a submit button at the bottom.

**When to use it:** Use forms for any user input: contact forms, sign-up forms, search, filters, settings.

## Why use this?

Forms solve data collection problems:

1. **Structured Input:** Organizes multiple inputs clearly
2. **Validation:** Can show errors and guide users
3. **Accessibility:** Proper labels help screen readers
4. **Consistency:** Familiar pattern users understand

**User Benefit:** Users can easily provide information in a clear, organized way.

**Design Principle:** Follows simplicity - forms should be clear and straightforward. Also follows feedback - forms should show validation and errors.

## Step-by-Step Implementation

### 1. Create Form Container

- Width: 100% (or max-width: 500px for centered)
- Padding: 24px
- Background: Transparent or card background

### 2. Add Input Fields

- Label: Above input, 14px, color: #666666
- Input: Full width, padding: 12px, border: 1px solid #E0E0E0, border-radius: 8px
- Margin-bottom: 16px between fields

### 3. Add Focus State

- Border: 2px solid #007AFF (accent color)
- Outline: None (remove default)
- Transition: 0.2s

### 4. Add Error State

- Border: 2px solid #FF3B30 (red)
- Error message: Below input, 12px, color: #FF3B30

### 5. Add Submit Button

- Primary button style
- Full width or right-aligned
- Margin-top: 24px

## Exact Specifications

### Text Input

**Container:**
- Width: 100%
- Margin-bottom: 16px

**Label:**
- Font size: 14px
- Font weight: 500
- Color: #666666 (light) or #CCCCCC (dark)
- Margin-bottom: 8px
- Display: Block

**Input:**
- Width: 100%
- Padding: 12px 16px
- Border: 1px solid #E0E0E0 (light) or #333333 (dark)
- Border radius: 8px
- Font size: 16px
- Background: #FFFFFF (light) or #1A1A1A (dark)
- Color: #000000 (light) or #FFFFFF (dark)

**Focus:**
- Border: 2px solid #007AFF
- Outline: None
- Transition: 0.2s ease-out

**Error:**
- Border: 2px solid #FF3B30
- Error text: 12px, #FF3B30, margin-top: 4px

## Source Reference

This pattern comes from:
- Transcript: "world's shortest UIUX design course.txt"
- Key concepts: Forms are part of design system. Inputs should be clear and accessible.

## Common Variations

1. **Simple Form:** Just inputs and submit
2. **Multi-Step Form:** Progress indicator, multiple steps
3. **Inline Form:** Horizontal layout (search bars)
4. **Filter Form:** Multiple inputs for filtering

## Things to Avoid

1. **No Labels:** Always label inputs
2. **Tiny Inputs:** Minimum 44px height for mobile
3. **No Validation:** Show errors clearly
4. **Poor Spacing:** Consistent spacing between fields
5. **Unclear Submit:** Button should be obvious

## Related Patterns

- [Buttons](./buttons.md) - Forms use submit buttons
- [Micro-Interactions](../animations/micro-interactions.md) - Form inputs use micro-interactions

---

**Next:** Learn about [Modals](./modals.md) for overlays and dialogs.

