# Daily Test Runner for Theramate
# Run this script daily to catch potential blockers early

param(
    [switch]$HealthCheck,
    [switch]$UserJourney,
    [switch]$All,
    [switch]$Verbose
)

Write-Host "🏥 Theramate Daily Test Runner" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set working directory
Set-Location "$PSScriptRoot"

# Function to run tests
function Run-Test {
    param(
        [string]$TestName,
        [string]$ScriptPath
    )
    
    Write-Host "`n🔄 Running $TestName..." -ForegroundColor Yellow
    
    try {
        if (Test-Path $ScriptPath) {
            $result = node $ScriptPath 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $TestName completed successfully" -ForegroundColor Green
                if ($Verbose) {
                    Write-Host $result -ForegroundColor Gray
                }
            } else {
                Write-Host "❌ $TestName failed with exit code $LASTEXITCODE" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Test script not found: $ScriptPath" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running $TestName: $_" -ForegroundColor Red
    }
}

# Function to check prerequisites
function Test-Prerequisites {
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
}

# Main execution
try {
    # Check prerequisites
    Test-Prerequisites
    
    # Determine which tests to run
    if ($All -or ((-not $HealthCheck) -and (-not $UserJourney))) {
        Write-Host "`n🚀 Running all tests..." -ForegroundColor Green
        $HealthCheck = $true
        $UserJourney = $true
    }
    
    # Run health check if requested
    if ($HealthCheck) {
        Run-Test "Health Check" "test-scripts/daily-health-check.js"
    }
    
    # Run user journey test if requested
    if ($UserJourney) {
        Run-Test "User Journey Test" "test-scripts/daily-user-journey-test.js"
    }
    
    Write-Host "`n🎉 Daily testing completed!" -ForegroundColor Green
    Write-Host "Check the results above for any issues that need attention." -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Fatal error during testing: $_" -ForegroundColor Red
    exit 1
}

# Optional: Generate summary report
if ($Verbose) {
    Write-Host "`n📊 Test Summary Report" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host "Date: $(Get-Date)" -ForegroundColor White
    Write-Host "Environment: Development" -ForegroundColor White
    $testsRun = ""
    if ($HealthCheck) { $testsRun += "Health Check, " }
    if ($UserJourney) { $testsRun += "User Journey" }
    Write-Host "Tests Run: $testsRun" -ForegroundColor White
}
