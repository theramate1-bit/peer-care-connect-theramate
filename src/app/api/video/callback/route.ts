// src/app/api/video/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    console.log('Kie.ai Callback Received:', JSON.stringify(callbackData, null, 2))

    const taskId = callbackData.data?.taskId
    const state = callbackData.data?.state // 'success' or 'fail'
    const resultJson = callbackData.data?.resultJson
    const failMsg = callbackData.data?.failMsg

    if (!taskId) {
      console.error('Callback: Missing taskId in payload')
      return NextResponse.json({ success: false, error: 'Missing taskId' }, { status: 400 })
    }

    // Find the video in InstantDB by taskId
    const videos = await db.videos.filter({ taskId }).get()
    const video = videos[0]

    if (!video) {
      console.warn(`Callback: No video found for taskId: ${taskId}`)
      return NextResponse.json({ success: false, error: `No video found for taskId: ${taskId}` }, { status: 404 })
    }

    let updateData: any = {
      status: 'processing', // Default to processing if state is unexpected
      updatedAt: Date.now(),
    }

    if (state === 'success') {
      let videoUrl: string | undefined
      let thumbnailUrl: string | undefined

      if (resultJson) {
        try {
          const parsedResult = JSON.parse(resultJson)
          const resultUrls = parsedResult.resultUrls || []
          const watermarkUrls = parsedResult.resultWaterMarkUrls || []
          videoUrl = resultUrls[0] || watermarkUrls[0]
          thumbnailUrl = videoUrls[0] // Use video URL as thumbnail for now
        } catch (parseError) {
          console.error('Callback: Failed to parse resultJson:', parseError)
        }
      }

      updateData = {
        status: 'completed',
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        updatedAt: Date.now(),
      }
      console.log(`Callback: Video ${video.id} (Task: ${taskId}) completed successfully.`)
    } else if (state === 'fail') {
      updateData = {
        status: 'failed',
        updatedAt: Date.now(),
        error: failMsg || 'Video generation failed via callback',
      }
      console.error(`Callback: Video ${video.id} (Task: ${taskId}) failed. Reason: ${failMsg}`)
    } else {
      console.warn(`Callback: Unexpected state for taskId ${taskId}: ${state}`)
    }

    await db.transact([
      db.tx.videos[video.id].update(updateData),
    ])

    return NextResponse.json({ success: true, message: 'Callback processed' })
  } catch (error) {
    console.error('Kie.ai Callback API error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}