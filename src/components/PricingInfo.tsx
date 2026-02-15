// src/components/PricingInfo.tsx
export default function PricingInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-2">
        <div className="text-blue-600 text-lg mr-2">💰</div>
        <h3 className="text-blue-800 font-semibold">Pricing Information</h3>
      </div>
      <div className="text-blue-700 text-sm space-y-1">
        <p><strong>Sora 2 Video Generation:</strong> 30 credits ($0.15) per 10-second video</p>
        <p><strong>Features:</strong> Audio included, watermark removal available</p>
        <p><strong>Quality:</strong> High-resolution, realistic motion and physics</p>
        <p className="text-xs text-blue-600 mt-2">
          💡 Tip: Each video generation uses credits from your Kie.ai account
        </p>
      </div>
    </div>
  )
}
