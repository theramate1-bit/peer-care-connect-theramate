# Remove Fallbacks and Implement Real-Time State Management

## Overview

Remove all fallback logic from Profile.tsx and related components, implement comprehensive real-time subscriptions for all data sources, and ensure database is the single source of truth with no mismatches.

## Problem Analysis

Profile.tsx currently has multiple issues:
1. **Fallback logic everywhere**: Using userProfile, user_metadata, and empty strings as fallbacks when database values are missing
2. **Incomplete real-time subscriptions**: Only subscribing to `users` and `therapist_profiles`, missing subscriptions for:
   - `practitioner_availability`
   - `practitioner_specializations`
   - `qualifications`
   - `connect_accounts`
3. **State mismatches**: Local state can get out of sync with database
4. **Empty string defaults**: Using `|| ""` instead of proper null handling

## Solution

Implement comprehensive real-time state management with database as single source of truth.

## Implementation Steps

### ✅ 1. Remove All Fallback Logic
**File**: `peer-care-connect/src/pages/Profile.tsx`

**Completed Changes**:
- Removed userProfile fallback when database query fails (lines 169-225)
- Removed metadata fallback logic for names (lines 244-264)
- Removed catch block fallback (lines 344-352)
- Removed fallback logic in save handler (lines 1057-1095)
- Removed `|| ""` empty string defaults throughout
- Removed "reload if empty" logic (lines 260-290)
- Removed specializations fallback from users.specializations array

**Replaced with**:
- Direct database values only (null if not present)
- Proper error handling that shows loading/error states instead of fallbacks
- Use nullish coalescing (`??`) only for actual null/undefined, not empty strings

### ✅ 2. Add Comprehensive Real-Time Subscriptions
**File**: `peer-care-connect/src/pages/Profile.tsx`

**Completed Subscriptions**:
- `practitioner_availability` - Updates `hasAvailability` state when availability changes
- `practitioner_specializations` - Updates `selectedSpecializations` when specializations change
- `qualifications` - Updates `qualifications` array when qualifications are added/removed/updated
- `connect_accounts` - Updates `connectAccountStatus` when Stripe Connect status changes

**Each subscription**:
- Updates local state immediately on INSERT/UPDATE/DELETE
- Handles conflicts when user is editing (shows notification, doesn't overwrite)
- Triggers data refresh if needed

### ✅ 3. Refactor Data Loading
**File**: `peer-care-connect/src/pages/Profile.tsx`

**Completed Changes**:
- Single database query on mount
- No fallbacks - shows loading state if query fails
- Added `loadingProfileData` and `profileDataError` states
- Use real-time subscriptions to keep data fresh
- Removed the "reload if empty" logic

### ✅ 4. Update State Management
**File**: `peer-care-connect/src/pages/Profile.tsx`

**Completed Changes**:
- All state updates come from real-time subscriptions or direct database queries
- Never uses fallback values
- Handles null/undefined properly (doesn't convert to empty strings)
- Shows proper loading/error states instead of fallbacks
- All input fields handle null values properly using `?? ""` for display

### ✅ 5. Update Related Components
**Files Verified**:
- `peer-care-connect/src/components/profile/ProfileCompletionWidget.tsx` - ✅ Uses real data, no fallbacks
- `peer-care-connect/src/components/practice/SchedulerEmbed.tsx` - ✅ Availability updates propagate via real-time

## Files Modified

1. `peer-care-connect/src/pages/Profile.tsx` - Main refactoring
2. `peer-care-connect/src/pages/practice/PracticeClientManagement.tsx` - Fixed duplicate import

## Success Criteria

- ✅ No fallback logic anywhere in Profile.tsx
- ✅ All data comes from database or real-time subscriptions
- ✅ Proper loading/error states instead of fallbacks
- ✅ Real-time updates work for all related tables
- ✅ No state mismatches between UI and database
- ✅ All input fields handle null values properly
- ✅ No linter errors

## Implementation Summary

### State Initialization
- Changed from empty strings (`""`) to `null` for all form fields
- Updated TypeScript types to reflect nullable values
- All state initialized as `null` instead of empty strings

### Real-Time Subscriptions Added
1. **practitioner_availability**: Monitors availability changes and updates `hasAvailability` state
2. **practitioner_specializations**: Tracks specialization changes and updates `selectedSpecializations`
3. **qualifications**: Watches qualification CRUD operations and updates `qualifications` array
4. **connect_accounts**: Monitors Stripe Connect account status changes

### Data Loading
- Removed all fallback chains (userProfile → metadata → empty string)
- Added proper loading states (`loadingProfileData`)
- Added error states (`profileDataError`) with retry functionality
- Single source of truth: database only

### Input Field Updates
- All inputs use `value={field ?? ""}` for display (null → empty string for UI)
- All onChange handlers convert empty strings to `null` for storage
- Proper null handling throughout

## Testing Checklist

- [x] Profile loads without fallbacks
- [x] Real-time updates work for all subscriptions
- [x] No state mismatches between components
- [x] Loading states display correctly
- [x] Error states display correctly
- [x] Input fields handle null values properly
- [x] Save operations work with null values
- [x] No linter errors

## Notes

- The `userProfile` from AuthContext is still used for conditional checks (e.g., `userProfile?.user_role !== 'client'`) but NOT as a data source
- Display values use `?? ""` to convert null to empty string for UI, but stored values remain null
- Real-time subscriptions handle conflicts gracefully by showing notifications when user is actively editing

