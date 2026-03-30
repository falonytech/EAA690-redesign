'use client'

/**
 * Root-level error UI (does not use root layout). Must include html/body.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem' }}>
        <h1 style={{ color: '#003366' }}>Something went wrong</h1>
        <p style={{ color: '#444', marginBottom: '1rem' }}>
          {process.env.NODE_ENV === 'development' ? error.message : 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: '#003366',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
