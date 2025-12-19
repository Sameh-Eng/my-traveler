import { LoadingSpinner } from '@/components/ui/Loading'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading MyTraveler</h2>
        <p className="text-gray-600">Preparing your travel experience...</p>
      </div>
    </div>
  )
}