import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
