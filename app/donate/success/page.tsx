import Link from 'next/link'

export default function DonateSuccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-eaa-blue mb-3">Thank You!</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your donation to EAA Chapter 690 has been received. A receipt will be sent to your email.
          Your generosity directly supports our youth programs, Young Eagles flights, and aviation education.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          EAA Chapter 690 is an IRS-approved 501(c)(3) non-profit. This donation may be tax-deductible.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-eaa-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/donate"
            className="bg-eaa-yellow text-eaa-blue px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors"
          >
            Donate Again
          </Link>
        </div>
      </div>
    </div>
  )
}
