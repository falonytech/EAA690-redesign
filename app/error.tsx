'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-eaa-blue mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        {process.env.NODE_ENV === 'development' ? error.message : 'Please try again.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-6 py-2 bg-eaa-blue text-white rounded-md hover:bg-eaa-light-blue font-medium"
      >
        Try again
      </button>
    </div>
  )
}
