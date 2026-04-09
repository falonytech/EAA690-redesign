'use client'

import { Suspense, useEffect, useState, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { useSession, twoFactor } from '@/lib/better-auth-client'
import Link from 'next/link'
import { shouldBypass2faForEmail, shouldEnforceMfaEnrollment } from '@/lib/auth-security'

type UserWithMfa = {
  email?: string | null
  twoFactorEnabled?: boolean
}

function AccountPageInner() {
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()
  const user = session?.user as UserWithMfa | undefined

  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const [setupOpen, setSetupOpen] = useState(false)
  const [enablePassword, setEnablePassword] = useState('')
  const [totpURI, setTotpURI] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [mfaBusy, setMfaBusy] = useState(false)

  const [disablePassword, setDisablePassword] = useState('')
  const [disableBusy, setDisableBusy] = useState(false)

  useEffect(() => {
    if (searchParams?.get('setup2fa') === '1') {
      setSetupOpen(true)
    }
  }, [searchParams])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Failed to open portal')
      window.location.href = data.url
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Something went wrong.')
      setPortalLoading(false)
    }
  }

  const startEnable = async (e: FormEvent) => {
    e.preventDefault()
    setMfaError('')
    if (!enablePassword.trim()) {
      setMfaError('Enter your password.')
      return
    }
    setMfaBusy(true)
    try {
      const res = await twoFactor.enable({
        password: enablePassword,
        issuer: 'EAA Chapter 690',
      })
      if (res.error) {
        setMfaError((res.error as { message?: string }).message ?? 'Could not start setup.')
        return
      }
      const data = res.data as { totpURI?: string; backupCodes?: string[] } | undefined
      if (data?.totpURI && data.backupCodes?.length) {
        setTotpURI(data.totpURI)
        setBackupCodes(data.backupCodes)
      } else {
        setMfaError('Unexpected response from server.')
      }
    } catch {
      setMfaError('Something went wrong. Try again.')
    } finally {
      setMfaBusy(false)
    }
  }

  const completeVerify = async (e: FormEvent) => {
    e.preventDefault()
    setMfaError('')
    const trimmed = verifyCode.trim()
    if (trimmed.length < 6) {
      setMfaError('Enter the 6-digit code from your app.')
      return
    }
    setMfaBusy(true)
    try {
      const res = await twoFactor.verifyTotp({ code: trimmed })
      if (res.error) {
        setMfaError((res.error as { message?: string }).message ?? 'Invalid code.')
        return
      }
      setTotpURI(null)
      setBackupCodes(null)
      setVerifyCode('')
      setEnablePassword('')
      setSetupOpen(false)
      window.location.reload()
    } catch {
      setMfaError('Something went wrong. Try again.')
    } finally {
      setMfaBusy(false)
    }
  }

  const disableMfa = async (e: FormEvent) => {
    e.preventDefault()
    setMfaError('')
    if (!disablePassword.trim()) {
      setMfaError('Enter your password to disable 2FA.')
      return
    }
    setDisableBusy(true)
    try {
      const res = await twoFactor.disable({ password: disablePassword })
      if (res.error) {
        setMfaError((res.error as { message?: string }).message ?? 'Could not disable 2FA.')
        return
      }
      setDisablePassword('')
      window.location.reload()
    } catch {
      setMfaError('Something went wrong. Try again.')
    } finally {
      setDisableBusy(false)
    }
  }

  const mfaEnabled = !!user?.twoFactorEnabled
  const showMfaBanner =
    shouldEnforceMfaEnrollment() &&
    !mfaEnabled &&
    !shouldBypass2faForEmail(user?.email ?? undefined)

  return (
    <AuthGuard requireAuth={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-eaa-blue mb-8">Account Settings</h1>

        {showMfaBanner && (
          <div
            className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 text-sm"
            role="status"
          >
            <strong className="font-semibold">Two-factor authentication required.</strong> Complete the
            setup below before using member-only areas on the live site.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-eaa-blue mb-4">Profile Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-700 mb-1">Name</dt>
              <dd className="text-gray-900">{session?.user?.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-700 mb-1">Email</dt>
              <dd className="text-gray-900">{session?.user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-700 mb-1">Account Created</dt>
              <dd className="text-gray-900">
                {session?.user?.createdAt
                  ? new Date(session.user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-eaa-blue mb-4">Security</h2>

          {mfaError && (
            <p className="mb-4 text-sm text-red-700 bg-red-50 rounded-md px-3 py-2" role="alert">
              {mfaError}
            </p>
          )}

          {!isPending && mfaEnabled && !totpURI && (
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Two-factor authentication</h3>
                  <p className="text-sm text-gray-500">Authenticator app (TOTP) is enabled.</p>
                </div>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <form onSubmit={disableMfa} className="mt-4 max-w-md space-y-3">
                <p className="text-sm text-gray-600">
                  To turn off 2FA, enter your password. Disabling is not recommended on production.
                </p>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Current password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
                <button
                  type="submit"
                  disabled={disableBusy}
                  className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                >
                  {disableBusy ? 'Disabling…' : 'Disable two-factor authentication'}
                </button>
              </form>
            </div>
          )}

          {!isPending && !mfaEnabled && !totpURI && (
            <div className="border-b border-gray-100 pb-6 mb-6">
              <button
                type="button"
                onClick={() => {
                  setSetupOpen((o) => !o)
                  setMfaError('')
                }}
                className="text-lg font-medium text-eaa-blue hover:text-eaa-light-blue"
              >
                {setupOpen ? '▼' : '▶'} Set up two-factor authentication
              </button>
              <p className="text-sm text-gray-500 mt-1">
                Use an authenticator app (Google Authenticator, 1Password, etc.). You will receive
                one-time backup codes — store them safely.
              </p>
              {setupOpen && (
                <form onSubmit={startEnable} className="mt-4 max-w-md space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  />
                  <button
                    type="submit"
                    disabled={mfaBusy}
                    className="bg-eaa-blue text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-eaa-light-blue disabled:opacity-50"
                  >
                    {mfaBusy ? 'Starting…' : 'Continue'}
                  </button>
                </form>
              )}
            </div>
          )}

          {totpURI && backupCodes && (
            <div className="border border-eaa-blue/30 rounded-lg p-4 mb-6 bg-blue-50/50">
              <h3 className="text-lg font-semibold text-eaa-blue mb-2">Finish setup</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 mb-4">
                <li>
                  <a href={totpURI} className="text-eaa-light-blue font-medium underline">
                    Add this account in your authenticator app
                  </a>{' '}
                  (opens otpauth link on supported devices).
                </li>
                <li>
                  Save these backup codes somewhere secure — each works once if you lose your phone:
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono text-xs bg-white rounded p-3 border">
                    {backupCodes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </li>
                <li>Enter the 6-digit code to confirm.</li>
              </ol>
              <form onSubmit={completeVerify} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm tracking-widest"
                />
                <button
                  type="submit"
                  disabled={mfaBusy}
                  className="bg-eaa-blue text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-eaa-light-blue disabled:opacity-50"
                >
                  {mfaBusy ? 'Verifying…' : 'Verify & enable'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-4">
            <Link
              href="/account/change-password"
              className="text-eaa-blue hover:text-eaa-light-blue font-medium"
            >
              Change Password →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-eaa-blue mb-1">Membership</h2>
          <p className="text-sm text-gray-500 mb-4">
            Manage your chapter membership billing, cancel or update your subscription, and download
            receipts.
          </p>
          {portalError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
              {portalError}
            </p>
          )}
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            aria-busy={portalLoading}
            aria-label={portalLoading ? 'Opening billing portal, please wait' : 'Manage your subscription'}
            className="bg-eaa-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {portalLoading ? 'Opening…' : 'Manage Subscription →'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Not yet a member?{' '}
            <Link href="/join" className="text-eaa-light-blue hover:underline font-medium">
              View membership options
            </Link>
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-eaa-blue mb-2">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            If you need assistance with your account, please contact the chapter administrator.
          </p>
          <Link href="/contact" className="text-eaa-blue hover:text-eaa-light-blue font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </AuthGuard>
  )
}

function AccountFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="w-8 h-8 border-4 border-eaa-blue border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountPageInner />
    </Suspense>
  )
}
