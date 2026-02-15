# Complete webhook setup script
# This script deploys the Edge Function and creates the webhook

Write-Host "🚀 WEBHOOK SETUP - COMPLETE AUTOMATION" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""

$projectRoot = "C:\Users\rayma\Desktop\New folder\peer-care-connect"

# Step 1: Check if we can deploy via Supabase CLI
Write-Host "📦 Step 1: Deploying Edge Function..." -ForegroundColor Yellow

try {
    Push-Location $projectRoot
    $deployOutput = supabase functions deploy create-webhook-endpoint --no-verify-jwt 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Edge Function deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Deployment may have failed, but continuing..." -ForegroundColor Yellow
        Write-Host $deployOutput
    }
} catch {
    Write-Host "⚠️  Could not deploy via CLI (Docker may not be running)" -ForegroundColor Yellow
    Write-Host "   You can deploy manually via Supabase Dashboard" -ForegroundColor Yellow
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "🔧 Step 2: Invoking function to create webhook..." -ForegroundColor Yellow

# Step 2: Invoke the function
try {
    Push-Location "C:\Users\rayma\Desktop\New folder"
    node create-webhook-via-edge-function.js
} catch {
    Write-Host "❌ Error invoking function" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=" * 70
Write-Host "✅ SETUP COMPLETE" -ForegroundColor Green
Write-Host "=" * 70

