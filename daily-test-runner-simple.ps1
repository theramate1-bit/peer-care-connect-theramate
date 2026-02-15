# Daily Test Runner for Theramate (Simplified)
# Run this script daily to catch potential blockers early

Write-Host "🏥 Theramate Daily Test Runner" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set working directory
Set-Location "$PSScriptRoot"

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Please create one with required variables." -ForegroundColor Red
    exit 1
}

# Check if test-scripts directory exists
if (Test-Path "test-scripts") {
    Write-Host "✅ Test scripts directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Test scripts directory not found. Please ensure test scripts are available." -ForegroundColor Red
    exit 1
}

# Run health check
Write-Host "`n🔄 Running Health Check..." -ForegroundColor Yellow
try {
    if (Test-Path "test-scripts/daily-health-check.js") {
        $healthResult = node "test-scripts/daily-health-check.js" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Health Check completed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Health Check failed with exit code $LASTEXITCODE" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Health check script not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running Health Check: $_" -ForegroundColor Red
}

# Run user journey test
Write-Host "`n🔄 Running User Journey Test..." -ForegroundColor Yellow
try {
    if (Test-Path "test-scripts/daily-user-journey-test.js") {
        $journeyResult = node "test-scripts/daily-user-journey-test.js" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ User Journey Test completed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ User Journey Test failed with exit code $LASTEXITCODE" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ User journey test script not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running User Journey Test: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Daily testing completed!" -ForegroundColor Green
Write-Host "Check the results above for any issues that need attention." -ForegroundColor Yellow
Write-Host "`n📊 Test Summary Report" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor White
Write-Host "Environment: Development" -ForegroundColor White
Write-Host "Tests Run: Health Check, User Journey" -ForegroundColor White
