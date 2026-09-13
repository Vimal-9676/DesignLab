import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  action?: React.ReactNode
}

export function ErrorMessage({ title = 'Something went wrong', message, action }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-red-800">{title}</p>
          <p className="text-sm text-red-700">{message}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  )
}
