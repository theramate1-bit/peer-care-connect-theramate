// src/components/ApiTestPanel.tsx
'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function ApiTestPanel() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const runApiTest = async () => {
    setIsTesting(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'Text to Video API Test',
        endpoint: '/api/video/generate',
        method: 'POST',
        data: {
          title: 'Test Video - Kie.ai Integration',
          brandName: 'TestBrand',
          productName: 'TestProduct',
          template: 'customer-testimonial',
          duration: 5,
          additionalDetails: 'Testing Kie.ai Sora 2 integration',
          aiModel: 'sora-2-medium',
          quality: 'medium',
          videoFormat: '9:16'
        }
      }
    ]

    for (const test of tests) {
      try {
        console.log(`Running test: ${test.name}`)
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.data)
        })

        const result = await response.json()
        
        setTestResults(prev => [...prev, {
          name: test.name,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          result: result,
          timestamp: new Date().toISOString()
        }])

        console.log(`${test.name} result:`, result)
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'error',
          statusCode: 0,
          result: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString()
        }])
      }
    }

    setIsTesting(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader>
        <CardTitle className="text-black">Kie.ai API Integration Test</CardTitle>
        <p className="text-gray-600 text-sm">
          Test the Kie.ai Sora 2 API integration to ensure it's working correctly
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runApiTest} 
            disabled={isTesting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isTesting ? 'Testing...' : 'Run API Tests'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-black">Test Results:</h3>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-black">{result.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.statusCode} - {result.status}
                    </span>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.timestamp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
