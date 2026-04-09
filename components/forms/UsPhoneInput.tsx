'use client'

import { formatUsPhoneInput } from '@/lib/us-phone'

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'inputMode' | 'value' | 'onChange' | 'autoComplete'
> & {
  value: string
  onValueChange: (value: string) => void
}

const US_PHONE_PATTERN = '\\d{3}-\\d{3}-\\d{4}'
const US_PHONE_OPTIONAL_PATTERN = `^$|${US_PHONE_PATTERN}`

/**
 * Controlled US phone field: inserts hyphens (xxx-xxx-xxxx) as the user types or pastes.
 */
export default function UsPhoneInput({
  value,
  onValueChange,
  className,
  placeholder = '555-555-5555',
  required,
  title = 'Ten-digit US phone number',
  ...rest
}: Props) {
  const pattern =
    required === true ? US_PHONE_PATTERN : required === false ? US_PHONE_OPTIONAL_PATTERN : undefined

  return (
    <input
      {...rest}
      required={required}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      className={className}
      placeholder={placeholder}
      title={title}
      pattern={pattern}
      value={value}
      onChange={(e) => onValueChange(formatUsPhoneInput(e.target.value))}
    />
  )
}
