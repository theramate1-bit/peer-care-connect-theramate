'use client'

import { db, Video } from '../db'

export default function VideoLibrary() {
  const { isLoading, error, data } = db.useQuery(db.query.videos.order('createdAt', 'desc'))

  if (isLoading) return <div className="text-center py-8">Loading videos...</div>
  if (error) return <div className="text-center py-8 text-red-600">Error: {error.message}</div>

  const videos = data?.videos || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Video Library</h2>
      
      {videos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No videos generated yet.</p>
          <p className="text-sm">Create your first video using the form above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: Video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {video.status === 'completed' && video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if thumbnail fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`text-gray-400 text-center ${video.status === 'completed' && video.thumbnailUrl ? 'hidden' : 'flex'} flex-col items-center justify-center w-full h-full`}>
                      <div className="text-4xl mb-2">
                        {video.status === 'processing' ? '⏳' : 
                         video.status === 'failed' ? '❌' : '🎥'}
                      </div>
                      <div className="text-sm capitalize">{video.status}</div>
                    </div>
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
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Video
                    </a>
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
  )
}
