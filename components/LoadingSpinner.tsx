interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  )
}
