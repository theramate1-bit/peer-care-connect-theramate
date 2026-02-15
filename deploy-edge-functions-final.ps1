# Final Edge Function Deployment Script
# Run this after setting STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY in Supabase Dashboard

Write-Host "🚀 Deploying Edge Functions to Supabase..." -ForegroundColor Green

# Check if Supabase CLI is available
try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Install from: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
    exit 1
}

# Navigate to the supabase directory
Set-Location supabase

# Deploy Edge Functions
Write-Host "📦 Deploying Edge Functions..." -ForegroundColor Blue

try {
    # Deploy check-subscription
    Write-Host "Deploying check-subscription..." -ForegroundColor Yellow
    supabase functions deploy check-subscription --project-ref aikqnvltuwwgifuocvto
    
    # Deploy create-checkout
    Write-Host "Deploying create-checkout..." -ForegroundColor Yellow
    supabase functions deploy create-checkout --project-ref aikqnvltuwwgifuocvto
    
    # Deploy customer-portal
    Write-Host "Deploying customer-portal..." -ForegroundColor Yellow
    supabase functions deploy customer-portal --project-ref aikqnvltuwwgifuocvto
    
    Write-Host "✅ All Edge Functions deployed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you have:" -ForegroundColor Yellow
    Write-Host "1. Set STRIPE_SECRET_KEY in Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "2. Set SUPABASE_SERVICE_ROLE_KEY in Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "3. Linked your project with: supabase link --project-ref aikqnvltuwwgifuocvto" -ForegroundColor Yellow
}

# Return to original directory
Set-Location ..

Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
Write-Host "Next: Test your Edge Functions with the test script" -ForegroundColor Blue
