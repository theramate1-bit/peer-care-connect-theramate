@echo off
echo 🏥 Theramate Daily Test Runner
echo =====================================
echo.

echo 🔍 Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create one with required variables.
    pause
    exit /b 1
)
echo ✅ .env file found

REM Check if test-scripts directory exists
if not exist "test-scripts" (
    echo ❌ Test scripts directory not found. Please ensure test scripts are available.
    pause
    exit /b 1
)
echo ✅ Test scripts directory found

echo.
echo 🚀 Running all tests...
echo.

REM Run health check
echo 🔄 Running Health Check...
if exist "test-scripts\daily-health-check.js" (
    node test-scripts\daily-health-check.js
    if %errorlevel% equ 0 (
        echo ✅ Health Check completed successfully
    ) else (
        echo ❌ Health Check failed
    )
) else (
    echo ❌ Health check script not found
)

echo.

REM Run user journey test
echo 🔄 Running User Journey Test...
if exist "test-scripts\daily-user-journey-test.js" (
    node test-scripts\daily-user-journey-test.js
    if %errorlevel% equ 0 (
        echo ✅ User Journey Test completed successfully
    ) else (
        echo ❌ User Journey Test failed
    )
) else (
    echo ❌ User journey test script not found
)

echo.
echo 🎉 Daily testing completed!
echo Check the results above for any issues that need attention.
echo.
echo 📊 Test Summary Report
echo =====================
echo Date: %date% %time%
echo Environment: Development
echo Tests Run: Health Check, User Journey
echo.
pause
