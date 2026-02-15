# InstantDB Setup Guide

## Step 1: Create InstantDB Account

1. Go to [instantdb.com](https://instantdb.com)
2. Sign up for a free account
3. Create a new app in the dashboard
4. Copy your App ID

## Step 2: Configure Environment

1. Open `.env.local` in your project
2. Replace `your-instantdb-app-id-here` with your actual App ID:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=your-actual-app-id
   ```

## Step 3: Initialize InstantDB Schema

Run these commands in your terminal:

```bash
# Initialize InstantDB CLI
npx instant-cli@latest init

# Push the schema to InstantDB
npx instant-cli@latest push schema
```

## Step 4: Test the Application

1. Make sure your dev server is running: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Try creating a video using the form
4. Watch it appear in the library in real-time!

## Troubleshooting

### If InstantDB CLI fails:
- Make sure you have a stable internet connection
- Try running `npm install -g @instantdb/cli` first
- Check your InstantDB dashboard for any issues

### If the app shows errors:
- Verify your App ID is correct in `.env.local`
- Make sure the schema was pushed successfully
- Check the browser console for specific error messages

## What You'll See

Once set up correctly:
- ✅ Video generation form works
- ✅ Videos appear in real-time library
- ✅ Status updates automatically (pending → processing → completed)
- ✅ No authentication required - just works!

## Next Steps

After basic setup works:
1. **Real AI Integration** - Replace mock generation with actual AI API
2. **File Uploads** - Add support for custom assets
3. **Video Editing** - Basic editing capabilities
4. **Export Features** - Download generated videos
5. **Analytics** - Track usage and performance
