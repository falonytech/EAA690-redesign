import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-eaa-blue mb-4">Page not found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-6 py-2 bg-eaa-blue text-white rounded-md hover:bg-eaa-light-blue font-medium"
      >
        Back to home
      </Link>
    </div>
  )
}
