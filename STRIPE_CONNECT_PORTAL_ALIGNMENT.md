# Stripe Connect Portal Alignment Check

## ✅ Migration Status

### Product Templates Table
- **Status**: ✅ **SYNCED**
- **Total Templates**: 24 platform templates across 18 service categories
- **Custom Templates**: 0 (practitioners can create these)

## 🔍 Stripe Connect Portal Alignment Analysis

### Current Implementation

#### 1. Product Creation Flow

**When practitioner creates product from template:**
1. User selects template → Applies to form → Creates product
2. **Stripe Integration** (`handleCreateProduct`):
   - Creates Stripe Product on **Connect Account** ✅
   - Creates Stripe Price on **Connect Account** ✅
   - Stores in `practitioner_products` table ✅

**Code Location**: `supabase/functions/stripe-payment/index.ts:1373-1385`
```typescript
// Create product in Stripe on the Connect account
const stripeProduct = await stripe.products.create({
  name,
  description,
  metadata: { practitioner_id, platform: 'peer-care-connect' },
}, { stripeAccount: practitioner.stripe_connect_account_id });

// Create price
const stripePrice = await stripe.prices.create({
  product: stripeProduct.id,
  unit_amount: price_amount,
  currency: 'gbp',
  metadata: { practitioner_id, duration_minutes, category },
}, { stripeAccount: practitioner.stripe_connect_account_id });
```

### ✅ Alignment Status

#### **Products ARE synced to Stripe Connect**
- ✅ Products created via templates appear in practitioner's Stripe Connect Express Dashboard
- ✅ Products can be managed through Stripe's portal
- ✅ Prices are correctly set on Connect accounts

#### **Practitioner Portal Access**
- ✅ Practitioners can access their Stripe Connect Express Dashboard
- ✅ They can view/edit products created from templates
- ✅ Products show with correct names, descriptions, and prices

### ⚠️ Potential Misalignment Issues

#### **Issue 1: service_category Not in Stripe Metadata**
- **Current**: Only `practitioner_id`, `duration_minutes`, `category` in Stripe metadata
- **Missing**: `service_category` (links to templates)
- **Impact**: Can't filter/group products by service category in Stripe
- **Recommendation**: Add `service_category` to Stripe metadata

#### **Issue 2: Template Info Not Preserved**
- **Current**: Template info stored only in `product_templates` table
- **Missing**: No link between created product and template used
- **Impact**: Can't track which template was used, can't update product from template
- **Recommendation**: Add `template_id` to `practitioner_products` or metadata

#### **Issue 3: Stripe Portal Product Management**
- **Current**: Practitioners can edit products in Stripe portal
- **Risk**: Changes in Stripe portal won't sync back to our platform
- **Impact**: Data inconsistency between Stripe and our database
- **Recommendation**: 
  - Either disable product editing in Stripe portal (Express Dashboard)
  - Or sync changes from Stripe webhooks

### 🔧 Recommended Fixes

#### **Fix 1: Add service_category to Stripe Metadata** ✅ **COMPLETED**
- ✅ Added `service_category` column to `practitioner_products` table
- ✅ Updated `handleCreateProduct` to accept `service_category` from body
- ✅ Added `service_category` to Stripe price metadata
- ✅ Saved `service_category` to database when creating products
- ✅ Products created from templates now include service category in Stripe

#### **Fix 2: Add template_id to practitioner_products**
```sql
ALTER TABLE practitioner_products 
ADD COLUMN template_id UUID REFERENCES product_templates(id);
```

#### **Fix 3: Webhook Handler for Product Updates**
- Listen for `product.updated` and `price.updated` events from Stripe
- Sync changes back to `practitioner_products` table
- Or disable product editing in Stripe Express Dashboard

### ✅ What Works Correctly

1. **Template System → Product Creation**
   - Templates provide default values ✅
   - Products created with correct structure ✅
   - Products appear in Stripe Connect portal ✅

2. **Stripe Connect Integration**
   - Products created on Connect accounts ✅
   - Prices set correctly ✅
   - Metadata includes practitioner info ✅

3. **Practitioner Portal Access**
   - Practitioners can access Express Dashboard ✅
   - Products visible and manageable ✅
   - Pricing information correct ✅

### 📋 Alignment Checklist

- [x] Products created from templates sync to Stripe Connect
- [x] Products appear in practitioner's Express Dashboard
- [x] Pricing matches template calculations
- [x] `service_category` added to Stripe metadata ✅ **COMPLETED**
- [x] `service_category` column added to `practitioner_products` table ✅ **COMPLETED**
- [ ] `template_id` linked to products (OPTIONAL - can be added later if needed)
- [ ] Webhook handler for Stripe product updates (OPTIONAL - consider if practitioners edit in Stripe portal)

