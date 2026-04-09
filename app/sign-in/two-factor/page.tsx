'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { twoFactor } from '@/lib/better-auth-client'

function safeRedirect(value: string | null): string {
  if (value && /^\/(?!\/)/.test(value)) return value
  return '/members'
}

function TwoFactorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = safeRedirect(searchParams?.get('redirect'))

  const [code, setCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [trustDevice, setTrustDevice] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const trimmed = code.trim()
    if (!trimmed) {
      setError('Enter your verification code.')
      setIsLoading(false)
      return
    }

    try {
      const result = useBackup
        ? await twoFactor.verifyBackupCode({ code: trimmed })
        : await twoFactor.verifyTotp({
            code: trimmed,
            trustDevice,
          })

      if (result.error) {
        setError(
          (result.error as { message?: string }).message ||
            'Invalid code. Try again.'
        )
        return
      }
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-eaa-blue">
            Two-factor verification
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the code from your authenticator app, or a one-time backup code.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="assertive">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="flex gap-4 rounded-lg border border-gray-200 p-1 bg-white">
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                !useBackup ? 'bg-eaa-blue text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setUseBackup(false)
                setCode('')
                setError('')
              }}
            >
              Authenticator
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                useBackup ? 'bg-eaa-blue text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                setUseBackup(true)
                setCode('')
                setError('')
              }}
            >
              Backup code
            </button>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              {useBackup ? 'Backup code' : '6-digit code'}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode={useBackup ? 'text' : 'numeric'}
              pattern={useBackup ? undefined : '[0-9]*'}
              autoComplete="one-time-code"
              autoFocus
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-eaa-blue focus:border-eaa-blue sm:text-sm tracking-widest"
              placeholder={useBackup ? 'XXXXXXXX' : '000000'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {!useBackup && (
            <div className="flex items-center">
              <input
                id="trust"
                name="trust"
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="h-4 w-4 text-eaa-blue focus:ring-eaa-blue border-gray-300 rounded"
              />
              <label htmlFor="trust" className="ml-2 block text-sm text-gray-900">
                Trust this device for 30 days
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-eaa-blue hover:bg-eaa-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eaa-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying…' : 'Continue'}
          </button>

          <p className="text-center text-sm">
            <Link href="/sign-in" className="font-medium text-eaa-blue hover:text-eaa-light-blue">
              ← Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="w-8 h-8 border-4 border-eaa-blue border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
    </div>
  )
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <TwoFactorForm />
    </Suspense>
  )
}
