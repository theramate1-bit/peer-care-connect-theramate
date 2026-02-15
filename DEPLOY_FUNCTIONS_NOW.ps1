# PowerShell script to deploy updated Edge Functions
# Run this script to deploy all three updated functions

Write-Host "🚀 Deploying Updated Edge Functions..." -ForegroundColor Green
Write-Host ""

$projectId = "aikqnvltuwwgifuocvto"
$basePath = "C:\Users\rayma\Desktop\New folder"

# Function to deploy via Supabase Dashboard instructions
function Show-DeploymentInstructions {
    param(
        [string]$FunctionName,
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "📦 $Description" -ForegroundColor Yellow
    Write-Host "   Function: $FunctionName" -ForegroundColor Cyan
    Write-Host "   File: $FilePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Steps:" -ForegroundColor White
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/$projectId/functions/$FunctionName" -ForegroundColor White
    Write-Host "   2. Click 'Edit' or 'Deploy'" -ForegroundColor White
    Write-Host "   3. Copy the entire content from: $FilePath" -ForegroundColor White
    Write-Host "   4. Paste into the editor" -ForegroundColor White
    Write-Host "   5. Click 'Deploy'" -ForegroundColor White
    Write-Host ""
}

Write-Host "⚠️  MCP deployment failed due to CDN issues. Use Supabase Dashboard instead:" -ForegroundColor Yellow
Write-Host ""

# Show instructions for each function
Show-DeploymentInstructions `
    -FunctionName "process-reminders" `
    -FilePath "$basePath\peer-care-connect\supabase\functions\process-reminders\index.ts" `
    -Description "Deploy process-reminders function (Authorization header fix)"

Show-DeploymentInstructions `
    -FunctionName "stripe-webhook" `
    -FilePath "$basePath\peer-care-connect\supabase\functions\stripe-webhook\index.ts" `
    -Description "Deploy stripe-webhook function (Authorization header fixes)"

Show-DeploymentInstructions `
    -FunctionName "send-email" `
    -FilePath "$basePath\supabase\functions\send-email\index.ts" `
    -Description "Deploy send-email function (Platform fee text fix - 0.5%)"

Write-Host "✅ After deploying all functions:" -ForegroundColor Green
Write-Host "   1. Test booking flow end-to-end" -ForegroundColor White
Write-Host "   2. Check email_logs table for sent emails" -ForegroundColor White
Write-Host "   3. Monitor Resend dashboard: https://resend.com/emails" -ForegroundColor White
Write-Host ""

