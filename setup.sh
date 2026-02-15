#!/bin/bash

# Simple setup script for AI Video Generator MVP

echo "🚀 Setting up AI Video Generator MVP..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    echo "NEXT_PUBLIC_INSTANT_APP_ID=your-instantdb-app-id-here" > .env.local
    echo "✅ Created .env.local - Please add your InstantDB App ID"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if InstantDB CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo "🔧 Initializing InstantDB..."
echo "Please run the following commands:"
echo "1. npx instant-cli@latest init"
echo "2. npx instant-cli@latest push schema"
echo ""
echo "Then start the development server:"
echo "npm run dev"
echo ""
echo "🎉 Setup complete! Don't forget to:"
echo "- Add your InstantDB App ID to .env.local"
echo "- Initialize InstantDB schema"
echo "- Start the dev server"
