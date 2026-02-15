'use client'

import { useState } from 'react'
import { db, id, Video } from '../db'

const TEMPLATES = [
  { id: 'lifestyle', name: 'Lifestyle Ad', description: 'Showcase your product in everyday life' },
  { id: 'demo', name: 'How-To Demo', description: 'Step-by-step product demonstration' },
  { id: 'testimonial', name: 'Customer Testimonial', description: 'Authentic customer review' },
  { id: 'unboxing', name: 'Unboxing Experience', description: 'Exciting product reveal' }
]

export default function VideoForm() {
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    productName: '',
    template: 'lifestyle'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      // Create video record in InstantDB
      const videoId = id()
      await db.transact([
        db.tx.videos[videoId].update({
          title: formData.title,
          brandName: formData.brandName,
          productName: formData.productName,
          template: formData.template,
          status: 'processing',
          createdAt: Date.now()
        })
      ])

      // Call the Kie API for real video generation
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        if (result.taskId) {
          // Update video record with taskId and start polling
          await db.transact([
            db.tx.videos[videoId].update({
              taskId: result.taskId,
              status: 'processing',
              updatedAt: Date.now()
            })
          ])
          pollForCompletion(videoId, result.taskId)
        } else {
          // Video completed immediately
          await db.transact([
            db.tx.videos[videoId].update({
              status: 'completed',
              videoUrl: result.videoUrl,
              thumbnailUrl: result.thumbnailUrl,
              updatedAt: Date.now()
            })
          ])
          setIsGenerating(false)
          setFormData({ title: '', brandName: '', productName: '', template: 'lifestyle' })
        }
      } else {
        // Generation failed
        await db.transact([
          db.tx.videos[videoId].update({
            status: 'failed',
            updatedAt: Date.now()
          })
        ])
        setIsGenerating(false)
        console.error('Video generation failed:', result.error)
      }

    } catch (error) {
      console.error('Error creating video:', error)
      setIsGenerating(false)
    }
  }

  const pollForCompletion = async (videoId: string, taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/generate?taskId=${taskId}`)
        const result = await response.json()

        if (result.success) {
          if (result.status === 'completed') {
            await db.transact([
              db.tx.videos[videoId].update({
                status: 'completed',
                videoUrl: result.videoUrl,
                thumbnailUrl: result.thumbnailUrl,
                updatedAt: Date.now()
              })
            ])
            clearInterval(pollInterval)
            setIsGenerating(false)
            setFormData({ title: '', brandName: '', productName: '', template: 'lifestyle' })
          } else if (result.status === 'failed') {
            await db.transact([
              db.tx.videos[videoId].update({
                status: 'failed',
                updatedAt: Date.now()
              })
            ])
            clearInterval(pollInterval)
            setIsGenerating(false)
            console.error('Video generation failed:', result.error)
          }
          // If still processing, continue polling
        } else {
          // API error
          await db.transact([
            db.tx.videos[videoId].update({
              status: 'failed',
              updatedAt: Date.now()
            })
          ])
          clearInterval(pollInterval)
          setIsGenerating(false)
          console.error('Status check failed:', result.error)
        }
      } catch (error) {
        console.error('Polling error:', error)
        clearInterval(pollInterval)
        setIsGenerating(false)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (isGenerating) {
        setIsGenerating(false)
        console.log('Video generation timeout')
      }
    }, 300000)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template
          </label>
          <select
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Video'}
        </button>
      </form>
    </div>
  )
}
