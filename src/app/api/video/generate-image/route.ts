// src/app/api/video/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const KIE_API_BASE_URL = 'https://api.kie.ai/api/v1'
const KIE_API_KEY = process.env.KIE_API_KEY

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string
    const duration = formData.get('duration') as string
    const quality = formData.get('quality') as string

    if (!image) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    if (!KIE_API_KEY) {
      return NextResponse.json(
        { error: 'KIE_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Convert image to base64 for API
    const imageBuffer = await image.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    console.log('Generating image to video with Kie.ai Sora 2')

    // Determine quality settings based on user selection
    const size = quality === 'high' || quality === 'max' ? 'high' : 'standard'
    
    // Calculate n_frames based on duration (assuming 1 frame per second)
    const nFrames = Math.min(Math.max(parseInt(duration) || 8, 1), 10)

    const response = await axios.post(
      `${KIE_API_BASE_URL}/jobs/createTask`,
      {
        model: "sora-2-image-to-video",
        callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/video/callback`,
        input: {
          image_urls: [`data:${image.type};base64,${imageBase64}`],
          prompt: prompt,
          aspect_ratio: "portrait", // 9:16 format for mobile
          n_frames: nFrames.toString(),
          size: size,
          remove_watermark: true
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIE_API_KEY}`
        },
        timeout: 30000
      }
    )

    if (response.data.code === 200 && response.data.data?.taskId) {
      return NextResponse.json({
        success: true,
        taskId: response.data.data.taskId,
        status: 'processing'
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: response.data.message || 'Failed to create image to video generation task' 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Image to video API error:', error)
    
    // Enhanced error handling based on official Kie.ai documentation
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid API key. Please check your Kie.ai API key.' 
          },
          { status: 401 }
        )
      } else if (error.response?.status === 429) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Rate limit exceeded. Please try again later.' 
          },
          { status: 429 }
        )
      } else if (error.response?.status === 400) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid request parameters. Please check your input.' 
          },
          { status: 400 }
        )
      } else if (error.response?.status === 402) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Insufficient credits. Please add credits to your Kie.ai account.' 
          },
          { status: 402 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
