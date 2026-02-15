@echo off
echo 🚀 Setting up AI Video Generator MVP...

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    echo NEXT_PUBLIC_INSTANT_APP_ID=your-instantdb-app-id-here > .env.local
    echo ✅ Created .env.local - Please add your InstantDB App ID
) else (
    echo ✅ .env.local already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

echo 🔧 Next steps:
echo 1. Add your InstantDB App ID to .env.local
echo 2. Run: npx instant-cli@latest init
echo 3. Run: npx instant-cli@latest push schema
echo 4. Run: npm run dev
echo.
echo 🎉 Setup complete!
pause
