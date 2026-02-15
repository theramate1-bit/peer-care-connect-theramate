// src/app/api/video/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateVideo, VideoGenerationRequest } from '@/lib/kie-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.brandName || !body.productName) {
      return NextResponse.json(
        { error: 'Brand name and product name are required' },
        { status: 400 }
      )
    }

    // Create enhanced request with all parameters
    const videoRequest: VideoGenerationRequest = {
      title: body.title || `${body.brandName} - ${body.productName}`,
      brandName: body.brandName,
      productName: body.productName,
      template: body.template || 'customer-testimonial',
      duration: body.duration || 8,
      additionalDetails: body.additionalDetails || '',
      aiModel: body.aiModel || 'sora-2-medium',
      quality: body.quality || 'medium',
      videoFormat: body.videoFormat || '9:16'
    }

    console.log('Generating video with request:', videoRequest)

    // Generate video using Kie.ai API
    const result = await generateVideo(videoRequest)

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate video' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      message: 'Video generation started successfully'
    })
  } catch (error) {
    console.error('Video generation API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Import the checkVideoStatus function
    const { checkVideoStatus } = await import('@/lib/kie-api')
    const result = await checkVideoStatus(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Video status API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
