# 🧪 Payment System Test Suite

## Overview
This test suite demonstrates the complete payment system user journeys for different user types in your therapy platform.

## 🎭 User Journey Tests

### 👤 **CLIENT User Journey**
1. **Browse therapist profiles** - View available practitioners
2. **Select service package** - Choose from different therapy types and pricing tiers
3. **View fee breakdown** - See transparent 0.5% marketplace fee calculation
4. **Complete payment** - Secure payment processing via Stripe
5. **View payment confirmation** - Receive confirmation and receipt

**Payment Examples:**
- Sports Therapy Session (£80): Client pays £80, Practitioner receives £79.60
- Massage Therapy Session (£70): Client pays £70, Practitioner receives £69.65
- Osteopath Session (£95): Client pays £95, Practitioner receives £94.52

### 👨‍⚕️ **THERAPIST User Journeys**

#### Sports Therapist (John Sports)
- Setup Stripe Connect account
- Configure business profile
- Create service packages
- View earnings dashboard
- Check payout status

#### Massage Therapist (Sarah Massage)
- Setup Stripe Connect account
- Configure business profile
- Create service packages
- View earnings dashboard
- Check payout status

#### Osteopath (Dr. Mike Osteo)
- Setup Stripe Connect account
- Configure business profile
- Create service packages
- View earnings dashboard
- Check payout status

### 👨‍💼 **ADMIN User Journey**
1. View verification dashboard
2. Review therapist profiles
3. Monitor payment system
4. Check analytics
5. Manage platform settings

## 🧮 Fee Structure

### Marketplace Fees
- **Platform Subscriptions**: 0% fee (direct subscription model)
- **Custom Services**: 0.5% marketplace fee
  - Sports Therapy, Massage Therapy, Osteopath sessions
  - Therapy projects and custom packages

### Automatic Calculations
- Database triggers automatically calculate fees
- Real-time fee breakdown display
- Transparent practitioner payout amounts

## 🚀 How to Test

### 1. Start Development Server
```bash
cd peer-care-connect
npm run dev
```

### 2. Access Test Pages
- **Payment Demo**: `http://localhost:5173/payments/demo`
- **Main Payments**: `http://localhost:5173/payments`
- **Connect Account**: `http://localhost:5173/payments/connect`

### 3. Test Different User Roles

#### As a Client:
1. Visit `/payments/demo`
2. Select different therapist types
3. View fee breakdowns
4. Test payment form (mock mode)

#### As a Therapist:
1. Visit `/payments/connect`
2. Setup Connect account
3. View earnings dashboard
4. Check payout status

#### As an Admin:
1. Visit `/admin/verification`
2. Review therapist profiles
3. Monitor payment system
4. Check analytics

## 🔧 Test Scripts

### Quick Demo
```bash
node test-scripts/quick-demo.js
```
Shows all user journeys and system status.

### Interactive Test
```bash
node test-scripts/interactive-test.js
```
Interactive menu to test specific user journeys.

### Full Test Suite
```bash
node test-scripts/user-journey-tests.js
```
Comprehensive test with timing and validation.

## ✅ What's Tested

- **User Authentication**: Protected routes and role-based access
- **Payment Flow**: Complete payment processing pipeline
- **Fee Calculations**: 0.5% marketplace fee accuracy
- **Stripe Integration**: Product sync and payment processing
- **Database Triggers**: Automatic fee calculations
- **Frontend Components**: Payment forms and fee displays
- **Edge Functions**: Stripe payment processing
- **RLS Policies**: Data security and access control

## 🎯 Key Features to Verify

1. **Service Package Selection**
   - Different therapist types
   - Pricing tiers (Basic, Standard, Premium)
   - Real-time fee calculations

2. **Payment Processing**
   - Secure payment form
   - Fee breakdown display
   - Payment confirmation

3. **Therapist Onboarding**
   - Stripe Connect setup
   - Business profile configuration
   - Service package creation

4. **Admin Monitoring**
   - Verification dashboard
   - Payment system monitoring
   - Analytics and reporting

## 🌐 Live Testing URLs

Once your dev server is running:

- **Main Demo**: `http://localhost:5173/payments/demo`
- **Payment Dashboard**: `http://localhost:5173/payments`
- **Connect Setup**: `http://localhost:5173/payments/connect`
- **Admin Panel**: `http://localhost:5173/admin/verification`

## 🚨 Troubleshooting

### Common Issues:
1. **Dev server not starting**: Check if you're in the correct directory (`peer-care-connect`)
2. **Payment form errors**: Verify Edge Function is deployed
3. **Database errors**: Check Supabase connection and migrations
4. **Fee calculation issues**: Verify database triggers are active

### Debug Commands:
```bash
# Check Edge Functions
npm run build

# Check database connection
# Visit Supabase Dashboard

# Check Stripe products
# Visit Stripe Dashboard
```

## 🎉 Success Indicators

Your payment system is working correctly when:

✅ All user journeys complete successfully  
✅ Fee calculations are accurate (0.5% marketplace fee)  
✅ Payment forms display fee breakdowns  
✅ Therapist Connect accounts can be created  
✅ Admin can monitor the system  
✅ Database triggers calculate fees automatically  
✅ Stripe products are synchronized  

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase Edge Functions are deployed
3. Confirm Stripe products are created
4. Check database migrations are applied

---

**Happy Testing! 🚀**
