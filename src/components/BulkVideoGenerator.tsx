'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const ugcStyles = [
  { id: 'product-showcase', name: 'Product Showcase', icon: '📦', checked: true },
  { id: 'customer-testimonial', name: 'Customer Testimonial', icon: '💬', checked: false },
  { id: 'unboxing-experience', name: 'Unboxing Experience', icon: '🎁', checked: false },
  { id: 'lifestyle-integration', name: 'Lifestyle Integration', icon: '☀️', checked: false },
  { id: 'how-to-tutorial', name: 'How-To Tutorial', icon: '📚', checked: false },
  { id: 'before-after', name: 'Before & After', icon: '↔️', checked: false },
  { id: 'day-in-life', name: 'Day in the Life', icon: '📅', checked: false },
  { id: 'pov-experience', name: 'POV Experience', icon: '👁️', checked: false },
]

const aiModels = [
  { id: 'sora-2-medium', name: 'Sora 2 - Medium Speed, High Quality', speed: 'medium' },
  { id: 'sora-2-fast', name: 'Sora 2 - Fast Speed, Good Quality', speed: 'fast' },
  { id: 'sora-2-pro', name: 'Sora 2 Pro - Best Quality', speed: 'pro' },
]

export default function BulkVideoGenerator() {
  const [activeTab, setActiveTab] = useState('text-to-video')
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    duration: '8',
    additionalDetails: '',
    ugcStyle: 'customer-testimonial',
    videoFormat: '9:16',
    aiModel: 'sora-2-medium',
    quality: 'medium',
    imageFile: null as File | null
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [taskId, setTaskId] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGenerationStatus('Starting video generation...')
    
    try {
      let requestBody: any = {
        title: `${formData.brandName} - ${formData.productName}`,
        brandName: formData.brandName,
        productName: formData.productName,
        template: formData.ugcStyle,
        duration: parseInt(formData.duration),
        additionalDetails: formData.additionalDetails,
        aiModel: formData.aiModel,
        quality: formData.quality,
        videoFormat: formData.videoFormat
      }

      // Handle Image to Video
      if (activeTab === 'image-to-video' && formData.imageFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('image', formData.imageFile)
        formDataToSend.append('prompt', `${formData.brandName} ${formData.productName} ${formData.additionalDetails}`)
        formDataToSend.append('duration', formData.duration)
        formDataToSend.append('quality', formData.quality)
        
        const response = await fetch('/api/video/generate-image', {
          method: 'POST',
          body: formDataToSend
        })
        
        const result = await response.json()
        if (result.success) {
          setTaskId(result.taskId)
          setGenerationStatus('Image to video generation started! Task ID: ' + result.taskId)
          pollForCompletion(result.taskId)
        } else {
          setGenerationStatus('Error: ' + result.error)
        }
      } else {
        // Handle Text to Video
        const response = await fetch('/api/video/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        const result = await response.json()

        if (result.success) {
          setTaskId(result.taskId || 'N/A')
          setGenerationStatus('Text to video generation started! Task ID: ' + (result.taskId || 'N/A'))
          if (result.taskId) {
            pollForCompletion(result.taskId)
          }
        } else {
          setGenerationStatus('Error: ' + result.error)
        }
      }
    } catch (error) {
      console.error('Error generating video:', error)
      setGenerationStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const pollForCompletion = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/generate?taskId=${taskId}`)
        const result = await response.json()

        if (result.success) {
          if (result.status === 'completed') {
            setGenerationStatus(`✅ Video completed! URL: ${result.videoUrl}`)
            clearInterval(pollInterval)
          } else if (result.status === 'failed') {
            setGenerationStatus(`❌ Video generation failed: ${result.error}`)
            clearInterval(pollInterval)
          } else {
            setGenerationStatus(`⏳ Processing... Status: ${result.status}`)
          }
        } else {
          setGenerationStatus(`❌ Status check failed: ${result.error}`)
          clearInterval(pollInterval)
        }
      } catch (error) {
        setGenerationStatus(`❌ Polling error: ${error}`)
        clearInterval(pollInterval)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (generationStatus.includes('⏳')) {
        setGenerationStatus('⏰ Generation timeout - please check manually')
      }
    }, 600000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Bulk Video Generator</h1>
        <p className="text-gray-700 text-base">Generate multiple UGC-style videos at once</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-300">
        <button 
          onClick={() => setActiveTab('text-to-video')}
          className={`pb-2 border-b-2 font-medium ${
            activeTab === 'text-to-video' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          Text to Video
        </button>
        <button 
          onClick={() => setActiveTab('image-to-video')}
          className={`pb-2 border-b-2 font-medium ${
            activeTab === 'image-to-video' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          Image to Video
        </button>
      </div>

      {/* Status Display */}
      {generationStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">{generationStatus}</p>
          {taskId && <p className="text-blue-600 text-xs mt-1">Task ID: {taskId}</p>}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* AI Model Section */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">AI Model</Label>
          <Select value={formData.aiModel} onChange={(e) => handleSelectChange('aiModel', e.target.value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {aiModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Quality Buttons */}
          <div className="flex space-x-2 mt-3">
            <Button 
              type="button" 
              variant="outline" 
              className={`${formData.quality === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
              onClick={() => handleSelectChange('quality', 'medium')}
            >
              Medium
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className={`${formData.quality === 'high' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
              onClick={() => handleSelectChange('quality', 'high')}
            >
              High
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className={`${formData.quality === 'max' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
              onClick={() => handleSelectChange('quality', 'max')}
            >
              Max 10s
            </Button>
          </div>
        </div>

        {/* UGC Style Section */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">UGC Style</Label>
          <Select value={formData.ugcStyle} onChange={(e) => handleSelectChange('ugcStyle', e.target.value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select UGC Style" />
            </SelectTrigger>
            <SelectContent>
              {ugcStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div className="flex items-center">
                    <span className="mr-2">{style.icon}</span>
                    <span className="text-black">{style.name}</span>
                    {style.checked && <span className="ml-2 text-green-600">✓</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Section */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">Duration (max 10s)</Label>
          <Input
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="8"
            className="w-32"
            min="1"
            max="10"
            type="number"
          />
          <p className="text-xs text-gray-600 mt-1">
            Sora 2 excels at longer videos - try 8-10 seconds for best results.
          </p>
        </div>

        {/* Product Name */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Product Name <span className="text-red-600">*</span>
          </Label>
          <Input
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="e.g., Ultra Glow Serum"
            required
          />
        </div>

        {/* Brand Name */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">
            Brand Name <span className="text-red-600">*</span>
          </Label>
          <Input
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder="e.g., BeautyLabs"
            required
          />
        </div>

        {/* Image Upload for Image to Video */}
        {activeTab === 'image-to-video' && (
          <div>
            <Label className="text-sm font-medium text-black mb-2 block">
              Upload Image <span className="text-red-600">*</span>
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={activeTab === 'image-to-video'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Upload an image to generate a video from it.
            </p>
          </div>
        )}

        {/* Video Format */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">Video Format</Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm">📱</span>
            <span className="text-sm font-medium text-black">9:16 - TikTok/Reels</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Auto-selected based on your UGC style. Override here if needed.
          </p>
        </div>

        {/* Additional Details */}
        <div>
          <Label className="text-sm font-medium text-black mb-2 block">Additional Details (Optional)</Label>
          <textarea
            name="additionalDetails"
            value={formData.additionalDetails}
            onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
            placeholder="Add any specific requirements or details..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black !important"
            style={{ color: 'black !important' }}
          />
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isGenerating || !formData.productName || !formData.brandName || (activeTab === 'image-to-video' && !formData.imageFile)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
          >
            {isGenerating ? 'Generating Videos...' : 'Generate Bulk Videos'}
          </Button>
        </div>
      </form>
    </div>
  )
}