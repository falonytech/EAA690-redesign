'use client'

import { useState } from 'react'
import Link from 'next/link'

const PRESET_AMOUNTS = [25, 50, 100, 250, 500]

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount('')
  }

  const handleCustomFocus = () => {
    setIsCustom(true)
    setSelectedAmount(0)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    setCustomAmount(value)
  }

  const donationAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount
  const donateUrl = 'https://www.eaa690.org/store/p/donations'

  return (
    <div>
      {/* Hero */}
      <section className="bg-eaa-blue text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Support EAA Chapter 690</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Help us keep aviation alive for the next generation. Every dollar goes directly to
            programs that educate and inspire our community.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Donation form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-eaa-blue mb-2">Make a Donation</h2>
              <p className="text-gray-500 text-sm mb-6">
                EAA Chapter 690 is an IRS-approved <strong>501(c)(3) non-profit</strong>. Your donation may be tax-deductible.
              </p>

              {/* Preset amounts */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select an Amount</p>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handlePresetClick(amount)}
                      className={`py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                        !isCustom && selectedAmount === amount
                          ? 'bg-eaa-blue text-white border-eaa-blue shadow-md'
                          : 'bg-white text-eaa-blue border-gray-200 hover:border-eaa-blue hover:bg-blue-50'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={handleCustomFocus}
                    className={`py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                      isCustom
                        ? 'bg-eaa-blue text-white border-eaa-blue shadow-md'
                        : 'bg-white text-eaa-blue border-gray-200 hover:border-eaa-blue hover:bg-blue-50'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Custom amount input */}
              {isCustom && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customAmount}
                      onChange={handleCustomChange}
                      placeholder="0.00"
                      autoFocus
                      className="w-full pl-8 pr-4 py-3 border-2 border-eaa-blue rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-eaa-blue/30"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {donationAmount > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Your donation</span>
                  <span className="text-eaa-blue font-bold text-xl">${donationAmount.toFixed(2)}</span>
                </div>
              )}

              {/* CTA */}
              <a
                href={donateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition-all ${
                  donationAmount > 0
                    ? 'bg-eaa-yellow text-eaa-blue hover:bg-yellow-400 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Donate Today!
              </a>

              <p className="text-xs text-gray-400 text-center mt-4">
                All transactions are secured through Stripe, which is certified to the highest compliance standards.
              </p>
            </div>
          </div>

          {/* Right: Mission & impact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-eaa-blue mb-4">Your Gift Makes a Difference</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EAA Chapter 690 is operated <strong>100% by donations and volunteers</strong>. While we host
                fundraisers that keep our regular operations running, it is our desire to expand our programs to
                enrich and educate the general public in all things aviation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Recognition of your contribution will be readily acknowledged! Consider a donation as your
                community outreach — any amount is greatly appreciated.
              </p>
            </div>

            {/* Impact tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '✈️', label: 'Young Eagles', desc: 'Free flights for youth ages 8–17' },
                { icon: '🎓', label: 'Ground School', desc: 'Affordable pilot education' },
                { icon: '🏕️', label: 'Summer Camp', desc: 'Aviation summer programming' },
                { icon: '🔧', label: 'Build Programs', desc: 'Hands-on aircraft construction' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 items-start">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-eaa-blue">{label}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 501c3 notice */}
            <div className="bg-eaa-blue text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-2">Tax Deductible</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                Founded in 1980, EAA Chapter 690 is an IRS-approved <strong className="text-white">501(c)(3)</strong> non-profit
                organization. Donations may be tax-deductible to the fullest extent permitted by law.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Looking to join the chapter instead?{' '}
              <Link href="/join" className="text-eaa-light-blue font-semibold hover:underline">
                View membership options →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
