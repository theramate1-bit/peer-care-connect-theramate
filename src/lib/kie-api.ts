// src/lib/kie-api.ts
import axios from 'axios'

const KIE_API_BASE_URL = 'https://api.kie.ai/api/v1'
const KIE_API_KEY = process.env.KIE_API_KEY

export interface VideoGenerationRequest {
  title: string
  brandName: string
  productName: string
  template: string
  duration?: number
  additionalDetails?: string
  aiModel?: string
  quality?: string
  videoFormat?: string
}

export interface VideoGenerationResponse {
  success: boolean
  taskId?: string
  videoUrl?: string
  thumbnailUrl?: string
  error?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed'
}

// Generate video using Kie.ai Sora 2 API (Official Implementation)
export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  try {
    if (!KIE_API_KEY) {
      throw new Error('KIE_API_KEY is not configured')
    }

    // Create a compelling prompt based on the template and product info
    const prompt = createPrompt(request)

    console.log('Generating video with Sora 2, prompt:', prompt)

    // Determine aspect ratio based on video format
    const aspectRatio = request.videoFormat === '9:16' ? 'portrait' : 'landscape'
    
    // Determine quality settings based on user selection
    const size = request.quality === 'high' || request.quality === 'max' ? 'high' : 'standard'
    
    // Calculate n_frames based on duration (assuming 1 frame per second)
    const nFrames = Math.min(Math.max(request.duration || 8, 1), 10)

    const response = await axios.post(
      `${KIE_API_BASE_URL}/jobs/createTask`,
      {
        model: "sora-2-text-to-video",
        callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/video/callback`,
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
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
        timeout: 30000 // 30 second timeout
      }
    )

    if (response.data.code === 200 && response.data.data?.taskId) {
      return {
        success: true,
        taskId: response.data.data.taskId,
        status: 'processing'
      }
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to create video generation task',
        status: 'failed'
      }
    }
  } catch (error) {
    console.error('Sora 2 API error:', error)
    
    // Enhanced error handling based on official Kie.ai documentation
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your Kie.ai API key.',
          status: 'failed'
        }
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          status: 'failed'
        }
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error: 'Invalid request parameters. Please check your input.',
          status: 'failed'
        }
      } else if (error.response?.status === 402) {
        return {
          success: false,
          error: 'Insufficient credits. Please add credits to your Kie.ai account.',
          status: 'failed'
        }
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    }
  }
}

// Check video generation status using Kie.ai API
export async function checkVideoStatus(taskId: string): Promise<VideoGenerationResponse> {
  try {
    if (!KIE_API_KEY) {
      throw new Error('KIE_API_KEY is not configured')
    }

    const response = await axios.get(
      `${KIE_API_BASE_URL}/jobs/getTaskResult/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      }
    )

    const data = response.data

    if (data.code === 200 && data.data) {
      const taskData = data.data

      if (taskData.state === 'success') {
        // Parse the result JSON to get video URLs
        const resultJson = JSON.parse(taskData.resultJson || '{}')
        const videoUrls = resultJson.resultUrls || []
        const watermarkUrls = resultJson.resultWaterMarkUrls || []

        return {
          success: true,
          videoUrl: videoUrls[0] || watermarkUrls[0], // Use first available URL
          thumbnailUrl: videoUrls[0], // Use video URL as thumbnail for now
          status: 'completed'
        }
      } else if (taskData.state === 'fail') {
        return {
          success: false,
          error: taskData.failMsg || 'Video generation failed',
          status: 'failed'
        }
      } else {
        // Still processing
        return {
          success: true,
          taskId: taskId,
          status: 'processing'
        }
      }
    } else {
      return {
        success: false,
        error: data.message || 'Failed to check task status',
        status: 'failed'
      }
    }
  } catch (error) {
    console.error('Status check error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'failed'
    }
  }
}

// Create compelling prompts optimized for Sora 2
function createPrompt(request: VideoGenerationRequest): string {
  const { brandName, productName, template, additionalDetails } = request

  const basePrompt = `Create a professional UGC video showcasing ${brandName}'s ${productName}. `

  let templatePrompt = ''
  switch (template) {
    case 'lifestyle':
      templatePrompt = `Show the product being used naturally in everyday life scenarios. Focus on authentic moments, genuine reactions, and how the product fits into daily routines. Use warm, inviting lighting and natural settings. The video should feel organic and relatable, showing real people enjoying the product in their daily lives.`
      break
    case 'demo':
      templatePrompt = `Create a step-by-step demonstration showing how to use the product. Highlight key features, benefits, and the ease of use. Use clear, instructional camera angles and good lighting. Show the product in action with detailed close-ups of important features. Make it educational and easy to follow.`
      break
    case 'testimonial':
      templatePrompt = `Create an authentic customer testimonial video. Show genuine reactions, before/after results, and personal stories about how the product helped. Use natural lighting and sincere expressions. The person should speak directly to the camera with enthusiasm about their positive experience with the product.`
      break
    case 'unboxing':
      templatePrompt = `Create an exciting unboxing experience. Show anticipation, first impressions, and detailed product features. Use dynamic camera movements and enthusiastic reactions. The person should be genuinely excited to reveal and explore the product, showing all its components and features.`
      break
    case 'product-showcase':
      templatePrompt = `Create a professional product showcase video. Highlight the product's key features, benefits, and unique selling points. Use clean, modern styling with good lighting and clear product shots. Focus on the product's quality and appeal.`
      break
    case 'how-to-tutorial':
      templatePrompt = `Create an educational how-to tutorial video. Show clear step-by-step instructions on how to use the product effectively. Use instructional camera angles, good lighting, and detailed demonstrations. Make it easy to follow and understand.`
      break
    case 'before-after':
      templatePrompt = `Create a compelling before and after comparison video. Show the transformation or improvement that the product provides. Use clear visual comparisons, good lighting, and authentic results. Highlight the product's effectiveness.`
      break
    case 'day-in-life':
      templatePrompt = `Create a "day in the life" style video showing how the product fits into someone's daily routine. Show authentic moments throughout the day, natural interactions, and how the product enhances their lifestyle. Use natural lighting and realistic scenarios.`
      break
    case 'pov-experience':
      templatePrompt = `Create a point-of-view experience video showing the product from the user's perspective. Use first-person camera angles, immersive shots, and authentic reactions. Make the viewer feel like they're experiencing the product themselves.`
      break
    default:
      templatePrompt = `Create an engaging promotional video that showcases the product's benefits and appeal to potential customers. Use dynamic camera work, good lighting, and focus on the product's key selling points.`
  }

  // Add additional details if provided
  const additionalPrompt = additionalDetails ? ` Additional requirements: ${additionalDetails}.` : ''
  
  return basePrompt + templatePrompt + additionalPrompt
}

// Poll for video completion
export async function pollVideoStatus(
  taskId: string, 
  onUpdate: (status: VideoGenerationResponse) => void,
  maxAttempts: number = 60, // 5 minutes max
  intervalMs: number = 5000 // 5 seconds
): Promise<VideoGenerationResponse> {
  let attempts = 0

  const poll = async (): Promise<VideoGenerationResponse> => {
    attempts++
    
    const status = await checkVideoStatus(taskId)
    onUpdate(status)

    if (status.status === 'completed' || status.status === 'failed') {
      return status
    }

    if (attempts >= maxAttempts) {
      return {
        success: false,
        error: 'Video generation timeout',
        status: 'failed'
      }
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs))
    return poll()
  }

  return poll()
}
