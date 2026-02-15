# Star Rating-Based Treatment Exchange Implementation Plan

## Summary of Requirements

1. **Star Rating Tiers for Matching:**
   - 4-5 stars: Can exchange with 4-5 star practitioners
   - 2-3 stars: Can exchange with 2-3 star practitioners  
   - 0-1 stars: Can exchange with 0-1 star practitioners

2. **Initial Rating System:**
   - All practitioners start at 0 stars after onboarding
   - First client rating sets their initial star rating
   - Average rating updates from all client ratings

3. **Credit System:**
   - 30-minute treatment = 20 credits
   - 60-minute treatment = 40 credits
   - Same credit amounts across all star ratings

---

## Database Schema Changes

### Action Point 1: Add `average_rating` Column to Users Table

**File:** `peer-care-connect/supabase/migrations/[timestamp]_add_average_rating_to_users.sql`

```sql
-- Add average_rating column to users table
-- This stores the calculated average star rating (0-5) for treatment exchange matching

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5);

-- Add total_reviews column for tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0);

-- Add comment to clarify usage
COMMENT ON COLUMN public.users.average_rating IS 'Average star rating (0-5). New practitioners start at 0 until first client rating. Used for treatment exchange tier matching: 0-1 stars, 2-3 stars, 4-5 stars.';

COMMENT ON COLUMN public.users.total_reviews IS 'Total number of reviews received from clients. Used for calculating average_rating.';

-- Update existing practitioners without ratings to have 0
UPDATE public.users 
SET average_rating = 0.00, total_reviews = 0
WHERE user_role IN ('sports_therapist', 'massage_therapist', 'osteopath')
  AND average_rating IS NULL;
```

---

## TypeScript Code Changes

### Action Point 2: Add Star Rating Tier Calculation Function

**File:** `peer-care-connect/src/lib/treatment-exchange.ts`

**Location:** Add after line 141 (after `checkCreditBalance` method)

```typescript
/**
 * Calculate star rating tier from average rating
 * Returns: 0 (0-1 stars), 1 (2-3 stars), 2 (4-5 stars)
 */
private static getStarRatingTier(averageRating: number | null | undefined): number {
  if (!averageRating || averageRating === 0) {
    return 0; // 0-1 stars
  }
  
  if (averageRating >= 4) {
    return 2; // 4-5 stars
  } else if (averageRating >= 2) {
    return 1; // 2-3 stars
  } else {
    return 0; // 0-1 stars
  }
}

/**
 * Calculate required credits based on session duration
 * 30 minutes = 20 credits, 60 minutes = 40 credits
 */
private static calculateRequiredCredits(durationMinutes: number): number {
  if (durationMinutes <= 30) {
    return 20; // 30 minutes = 20 credits
  } else if (durationMinutes <= 60) {
    return 40; // 60 minutes = 40 credits
  } else {
    // For longer sessions, calculate proportionally
    // 30 min = 20 credits, so 1 min = 20/30 = 0.667 credits
    return Math.round((durationMinutes / 30) * 20);
  }
}
```

### Action Point 3: Update `getEligiblePractitioners` to Filter by Star Rating Tier

**File:** `peer-care-connect/src/lib/treatment-exchange.ts`

**Location:** Replace the entire `getEligiblePractitioners` method (lines 176-258)

```typescript
static async getEligiblePractitioners(
  userId: string,
  filters?: {
    specializations?: string[];
    rating_threshold?: number;
    max_distance_km?: number;
    session_types?: string[];
  }
): Promise<EligiblePractitioner[]> {
  try {
    // Get user's preferences and rating
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('treatment_exchange_preferences, latitude, longitude, average_rating')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const userPrefs = userData?.treatment_exchange_preferences as TreatmentExchangePreferences || {};
    const userLat = userData?.latitude;
    const userLng = userData?.longitude;
    const userRating = userData?.average_rating || 0;
    const userTier = this.getStarRatingTier(userRating);

    // Build query - REMOVE rating threshold filter, we'll filter by tier instead
    let query = supabase
      .from('users')
      .select(`
        id,
        user_id: id,
        first_name,
        last_name,
        user_role,
        specializations,
        average_rating,
        total_sessions,
        profile_photo_url,
        location,
        latitude,
        longitude,
        treatment_exchange_preferences
      `)
      .in('user_role', ['sports_therapist', 'massage_therapist', 'osteopath'])
      .eq('treatment_exchange_enabled', true)
      .eq('profile_completed', true)
      .neq('id', userId); // Exclude self

    const { data, error } = await query;

    if (error) throw error;

    let practitioners = data || [];

    // Filter by star rating tier - only show practitioners in same tier
    practitioners = practitioners.filter(p => {
      const practitionerTier = this.getStarRatingTier(p.average_rating);
      return practitionerTier === userTier;
    });

    // Apply specialization filter
    if (filters?.specializations && filters.specializations.length > 0) {
      practitioners = practitioners.filter(p => 
        p.specializations && 
        filters.specializations!.some(spec => p.specializations.includes(spec))
      );
    }

    // Apply distance filter
    if (filters?.max_distance_km && userLat && userLng) {
      const maxDistance = filters.max_distance_km;
      practitioners = practitioners.filter(p => {
        if (!p.latitude || !p.longitude) return false;
        
        const distance = this.calculateDistance(userLat, userLng, p.latitude, p.longitude);
        return distance <= maxDistance;
      });
    }

    return practitioners;
  } catch (error) {
    console.error('Error getting eligible practitioners:', error);
    return [];
  }
}
```

### Action Point 4: Update Credit Calculation in `sendExchangeRequest`

**File:** `peer-care-connect/src/lib/treatment-exchange.ts`

**Location:** Replace lines 276-277

```typescript
// OLD:
// Check credit balance first - fixed cost: 20 credits per 60-minute session
const requiredCredits = 20; // Fixed: 20 credits per session (60 minutes)

// NEW:
// Calculate required credits based on duration
const requiredCredits = this.calculateRequiredCredits(requestData.duration_minutes);
```

### Action Point 5: Update Credit Transfer in `acceptExchangeRequest`

**File:** `peer-care-connect/src/lib/treatment-exchange.ts`

**Location:** Multiple replacements needed

**1. Replace line 447:**
```typescript
// OLD:
credits_exchanged: 20 // Fixed: 20 credits per 60-minute session

// NEW:
credits_exchanged: this.calculateRequiredCredits(request.duration_minutes)
```

**2. Replace line 485:**
```typescript
// OLD:
credit_cost: 20, // Fixed: 20 credits per 60-minute session

// NEW:
credit_cost: this.calculateRequiredCredits(request.duration_minutes),
```

**3. Replace line 498:**
```typescript
// OLD:
// Atomic credit transfer: requester -> recipient (fixed 20 credits per session)
const requiredCredits = 20; // Fixed: 20 credits per 60-minute session

// NEW:
// Calculate credits based on duration
const requiredCredits = this.calculateRequiredCredits(request.duration_minutes);
```

**4. Update the description in credits_transfer call (line 505):**
```typescript
// OLD:
p_description: 'Treatment exchange transfer'

// NEW:
p_description: `Treatment exchange transfer (${request.duration_minutes} minutes)`
```

### Action Point 6: Update Review System to Calculate Average Rating

**File:** `peer-care-connect/src/lib/review-system.ts`

**Location:** Update `getPractitionerStats` method (around line 281) to include `practitioner_ratings` table

```typescript
static async getPractitionerStats(practitionerId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { [key: number]: number };
}> {
  try {
    // Get ratings from reviews table (public reviews)
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('therapist_id', practitionerId)
      .eq('review_status', 'published');

    if (reviewsError) throw reviewsError;

    // Also get ratings from practitioner_ratings table (private feedback)
    const { data: practitionerRatings, error: ratingsError } = await supabase
      .from('practitioner_ratings')
      .select('rating')
      .eq('practitioner_id', practitionerId)
      .eq('status', 'active');

    if (ratingsError) throw ratingsError;

    // Combine ratings from both tables
    const allRatings = [
      ...(reviews || []).map(r => r.overall_rating),
      ...(practitionerRatings || []).map(r => r.rating)
    ];

    const totalReviews = allRatings.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {}
      };
    }

    const averageRating = allRatings.reduce((sum, r) => sum + r, 0) / totalReviews;

    // Calculate rating breakdown
    const ratingBreakdown: { [key: number]: number } = {};
    allRatings.forEach(rating => {
      ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      totalReviews,
      ratingBreakdown
    };
  } catch (error) {
    console.error('Error getting practitioner stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: {}
    };
  }
}
```

### Action Point 7: Ensure New Practitioners Start with 0 Rating

**File:** `peer-care-connect/src/lib/onboarding-utils.ts`

**Location:** Update `userUpdateData` object (around line 136)

```typescript
const userUpdateData: any = {
  phone: getFieldValue(onboardingData.phone),
  onboarding_status: 'completed',
  profile_completed: true,
  is_active: true,
  average_rating: 0.00, // NEW: Ensure new practitioners start at 0
  total_reviews: 0, // NEW: Start with 0 reviews
  updated_at: new Date().toISOString(),
};
```

---

## UI Updates

### Action Point 8: Update Credits Page to Show Star Rating Tiers

**File:** `peer-care-connect/src/pages/Credits.tsx`

**Location:** Add helper function at the top of the component (after line 86)

```typescript
// Helper function to get tier label
const getStarTierLabel = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return '0-1 Stars';
  if (rating >= 4) return '4-5 Stars';
  if (rating >= 2) return '2-3 Stars';
  return '0-1 Stars';
};

// Helper function to calculate credit cost
const calculateCreditCost = (durationMinutes: number): number => {
  if (durationMinutes <= 30) return 20;
  if (durationMinutes <= 60) return 40;
  return Math.round((durationMinutes / 30) * 20);
};
```

**Location:** In the practitioner card display (around line 555), add tier badge:

```typescript
{selectedPractitioner.average_rating !== undefined && (
  <Badge variant="outline" className="text-xs">
    {getStarTierLabel(selectedPractitioner.average_rating)} Tier
  </Badge>
)}
```

**Location:** In the booking form (around line 407), update credit cost display:

```typescript
// Replace any existing credit cost display with:
<div className="text-sm text-muted-foreground">
  Cost: {calculateCreditCost(bookingData.duration_minutes)} credits
  ({bookingData.duration_minutes} minutes)
</div>
```

### Action Point 9: Update Treatment Exchange Page

**File:** `peer-care-connect/src/pages/practice/TreatmentExchange.tsx`

**Location:** Add the same helper functions and tier display as in Credits.tsx

---

## Database Function Updates

### Action Point 10: Update Credit Cost Function (Optional - for consistency)

**File:** `peer-care-connect/supabase/migrations/[timestamp]_update_credit_cost_for_treatment_exchange.sql`

```sql
-- Update get_practitioner_credit_cost to support treatment exchange duration-based pricing
-- Note: This function is used for regular bookings, but treatment exchange uses fixed rates
-- We'll keep this function as-is for regular bookings, but treatment exchange will use
-- the TypeScript calculateRequiredCredits function

-- No changes needed to this function - treatment exchange uses its own calculation
```

---

## Testing Checklist

- [ ] Verify new practitioners start with 0 rating
- [ ] Test star rating tier filtering (4-5 stars only see 4-5 stars, etc.)
- [ ] Test credit calculation: 30 min = 20 credits, 60 min = 40 credits
- [ ] Test credit transfer in treatment exchange flow
- [ ] Verify average rating updates when client submits review
- [ ] Test UI displays correct tier badges
- [ ] Test UI displays correct credit costs based on duration

---

## Migration Order

1. Run migration to add `average_rating` and `total_reviews` columns
2. Update TypeScript code in `treatment-exchange.ts`
3. Update TypeScript code in `review-system.ts`
4. Update TypeScript code in `onboarding-utils.ts`
5. Update UI components
6. Test end-to-end flow

---

## Notes

- The `average_rating` column will be calculated and updated by the `ReviewSystem.updatePractitionerRating()` method whenever a review is submitted
- Star rating tiers are calculated on-the-fly in TypeScript, not stored in the database
- Credit costs for treatment exchange are now duration-based, but regular bookings may still use the `get_practitioner_credit_cost` function
- All existing practitioners without ratings will be set to 0.00 by the migration

