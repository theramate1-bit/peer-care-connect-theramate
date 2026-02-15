'use client'

import { useState } from 'react'

const navigationItems = [
  { id: 'generate', label: 'Generate', icon: '🎥', active: true },
  { id: 'bulk', label: 'Bulk Generate', icon: '⊞', active: false },
  { id: 'feed', label: 'Feed', icon: '📄', active: false },
  { id: 'generations', label: 'Generations', icon: '📋', active: false },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('generate')

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button className="mr-3 text-gray-400 hover:text-white">
          ←
        </button>
        <h1 className="text-xl font-semibold text-white">Video Studio</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
              activeItem === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium text-white">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm text-white">👤</span>
          </div>
          <span className="text-gray-300 text-white">User</span>
        </div>
      </div>
    </div>
  )
}
