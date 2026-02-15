# Product Templates System - Implementation Guide

## Overview

The product template system allows practitioners to:
1. **Use pre-built templates** for quick product creation
2. **Save their products as custom templates** for reuse
3. **Customize templates** before creating products

## Database Structure

### `product_templates` Table

- **Platform Templates**: `is_platform_template = true`, `practitioner_id = NULL`
  - Available to all practitioners
  - Managed by admins
  
- **Custom Templates**: `is_platform_template = false`, `practitioner_id = [user_id]`
  - Created by individual practitioners
  - Only visible to the creator

### Key Fields

- `service_category`: Links to `services_offered` values
- `name_template`: Template string with variables like `{duration}`, `{service}`
- `description_template`: Template description
- `default_duration_minutes`: Default session duration
- `suggested_price_per_hour`: For hourly pricing calculations
- `pricing_type`: 'hourly', 'fixed', or 'range'

## Features Implemented

### 1. Template Selection

When creating a product and a service category is selected:
- **"Use Template" button** appears next to the service category field
- Clicking it opens `ProductTemplateSelector` component
- Shows all available templates (platform + custom) for that service
- Templates display:
  - Template name
  - Duration
  - Estimated price
  - Preview description
  - Platform vs Custom badge

### 2. Template Application

Selecting a template:
- Automatically fills in:
  - Product name (with variables replaced)
  - Description (with variables replaced)
  - Duration
  - Price (calculated from hourly rate or template price)
- Practitioner can then customize all fields before saving

### 3. Save as Template

After creating/editing a product:
- **"Save as Template" button** appears (only for new products)
- Saves the current product configuration as a custom template
- Template can be reused for future products in the same service category

## Template Variables

Templates support variables in `name_template` and `description_template`:

- `{duration}` - Replaced with session duration in minutes
- `{service}` - Replaced with service label (e.g., "Sports Massage")
- `{service_lower}` - Replaced with lowercase service label

Example:
```
Template: "{duration}-minute {service} Session"
Result: "60-minute Sports Massage Session"
```

## Files Created

1. **`supabase/migrations/20250125_product_templates.sql`**
   - Creates `product_templates` table
   - Sets up RLS policies
   - Enables platform templates for all practitioners

2. **`supabase/migrations/20250125_seed_product_templates.sql`**
   - Seeds platform-wide templates for all service types
   - Includes 2-3 templates per service category

3. **`src/lib/product-templates.ts`**
   - Library functions for template management
   - `getTemplatesForService()` - Get templates for a service
   - `createTemplateFromProduct()` - Save product as template
   - `applyTemplate()` - Apply template to product data

4. **`src/components/practitioner/ProductTemplateSelector.tsx`**
   - UI component for template selection
   - Shows template previews with estimated pricing
   - Allows selection and application

5. **Updated `src/components/practitioner/ProductForm.tsx`**
   - Integrated template selector
   - Added "Use Template" button
   - Added "Save as Template" button
   - Template application logic

## Usage Flow

### Creating Product from Template

1. Navigate to Services & Pricing
2. Click "Add Product"
3. Select a service category
4. Click "Use Template" button
5. Browse and select a template
6. Click "Use Template" to apply
7. Customize fields as needed
8. Click "Create Product"

### Saving Product as Template

1. Create or edit a product
2. Fill in all details
3. Click "Save as Template" button
4. Template saved for reuse

## Next Steps

### To Deploy:

1. **Run migrations**:
   ```bash
   supabase migration up
   ```

2. **Verify templates**:
   - Check `product_templates` table has seed data
   - Verify platform templates are visible to practitioners

3. **Test flow**:
   - Create product with template
   - Save product as custom template
   - Reuse custom template

## Future Enhancements

- [ ] Template editing UI for practitioners
- [ ] Template sharing between practitioners
- [ ] Template categories/tags
- [ ] Bulk template creation tools
- [ ] Template analytics (most used, etc.)

