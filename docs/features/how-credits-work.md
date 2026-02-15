# How the Credit System Works

A guide to understanding the credit-based economy for junior developers.

## Overview

The credit system allows practitioners to earn and spend credits for treatment exchanges. Credits are like a currency within the platform.

## Key Concepts

### Credit Balance
- Each practitioner has a credit balance
- Credits are earned by providing treatments
- Credits are spent to receive treatments

### Credit Transactions
Every credit movement is recorded:
- **Type:** earn, spend, purchase, refund, transfer
- **Amount:** Number of credits
- **Balance before/after:** For tracking
- **Reference:** Links to booking/session

## How Credits Work

### Earning Credits
```typescript
// When practitioner provides treatment
await CreditManager.updateBalance(
  practitionerId,
  creditsEarned,      // Amount earned
  'earn',             // Transaction type
  'Treatment provided' // Description
);
```

### Spending Credits
```typescript
// When practitioner receives treatment
await CreditManager.updateBalance(
  practitionerId,
  -creditsCost,       // Amount spent (negative)
  'spend',            // Transaction type
  'Treatment received' // Description
);
```

## Key Functions

### Get Balance
```typescript
const balance = await CreditManager.getBalance(userId);
// Returns: number (current credit balance)
```

### Update Balance
```typescript
await CreditManager.updateBalance(
  userId,
  amount,           // Positive to add, negative to subtract
  transactionType, // 'earn' | 'spend' | 'purchase' | 'refund'
  description       // What this transaction is for
);
```

## Credit Rates

Different services have different credit costs:
- 30-minute session: X credits
- 60-minute session: Y credits
- 90-minute session: Z credits

Rates are stored in `credit_rates` table.

## Transaction Flow

### Treatment Exchange Flow
```
1. Practitioner A requests treatment from Practitioner B
   ↓
2. System checks Practitioner A has enough credits
   ↓
3. Credits deducted from Practitioner A
   ↓
4. Treatment provided
   ↓
5. Credits awarded to Practitioner B
```

## Database Tables

### `credits`
Stores current balance for each practitioner

### `credit_transactions`
Records all credit movements (history)

### `credit_rates`
Defines credit costs for different services

## Common Questions

**Q: Can credits go negative?**
A: No, the system validates sufficient balance before spending.

**Q: What happens if payment fails?**
A: Credits are not deducted. Transaction is rolled back.

**Q: Can credits be refunded?**
A: Yes, via refund transaction type.

## Related Files

- `src/lib/credits.ts` - Credit management functions
- `src/pages/Credits.tsx` - Credit UI
- `supabase/migrations/*_credit_system.sql` - Database schema

## Next Steps

- Read `src/lib/credits.ts`
- Understand the transaction types
- Review credit rate calculations
- Study the treatment exchange flow

---

**Last Updated:** 2025-02-09
