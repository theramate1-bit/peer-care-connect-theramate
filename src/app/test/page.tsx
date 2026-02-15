'use client'

import { useState } from 'react'

const TEMPLATES = [
  { id: 'lifestyle', name: 'Lifestyle Ad', description: 'Showcase your product in everyday life' },
  { id: 'demo', name: 'How-To Demo', description: 'Step-by-step product demonstration' },
  { id: 'testimonial', name: 'Customer Testimonial', description: 'Authentic customer review' },
  { id: 'unboxing', name: 'Unboxing Experience', description: 'Exciting product reveal' }
]

// Mock data for testing without InstantDB
const mockVideos = [
  {
    id: '1',
    title: 'Sample Video 1',
    brandName: 'Test Brand',
    productName: 'Test Product',
    template: 'lifestyle',
    status: 'completed',
    videoUrl: '/placeholder-video.mp4',
    thumbnailUrl: '/placeholder-thumbnail.jpg',
    createdAt: Date.now() - 86400000
  },
  {
    id: '2',
    title: 'Sample Video 2',
    brandName: 'Demo Brand',
    productName: 'Demo Product',
    template: 'demo',
    status: 'processing',
    createdAt: Date.now() - 3600000
  }
]

export default function TestPage() {
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    productName: '',
    template: 'lifestyle'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [videos, setVideos] = useState(mockVideos)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate video generation
    const newVideo = {
      id: Date.now().toString(),
      title: formData.title,
      brandName: formData.brandName,
      productName: formData.productName,
      template: formData.template,
      status: 'processing',
      createdAt: Date.now()
    }

    setVideos(prev => [newVideo, ...prev])

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setVideos(prev => 
        prev.map(video => 
          video.id === newVideo.id 
            ? { ...video, status: 'completed', videoUrl: '/placeholder-video.mp4', thumbnailUrl: '/placeholder-thumbnail.jpg' }
            : video
        )
      )
      setIsGenerating(false)
      setFormData({ title: '', brandName: '', productName: '', template: 'lifestyle' })
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Video Generator</h1>
          <p className="text-gray-600">Create UGC videos with AI - Simple, Fast, Effective</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Test Mode:</strong> This is a demo version. To enable real-time features, set up InstantDB.
            </p>
          </div>
        </div>
        
        {/* Video Generation Form */}
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mb-8">
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

        {/* Video Library */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Video Library</h2>
          
          {videos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No videos generated yet.</p>
              <p className="text-sm">Create your first video using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {video.status === 'completed' && video.thumbnailUrl ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎥</div>
                          <div className="text-sm">Video Ready</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <div className="text-sm">{video.status}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Brand:</strong> {video.brandName}</p>
                      <p><strong>Product:</strong> {video.productName}</p>
                      <p><strong>Template:</strong> {video.template}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                      
                      {video.status === 'completed' && video.videoUrl && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Video
                        </button>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
