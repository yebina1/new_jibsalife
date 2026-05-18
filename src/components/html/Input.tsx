import './Input.css'

type InputProps = {
  value: string
  placeholder?: string
  ariaLabel?: string
  className?: string
  maxLength?: number
  multiline?: boolean
  rows?: number
  type?: 'text' | 'password' | 'email' | 'number'
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

function Input({
  value,
  placeholder,
  ariaLabel,
  className,
  maxLength,
  multiline = false,
  rows,
  type = 'text',
  onChange,
  onFocus,
  onBlur,
}: InputProps) {
  const inputClassName = ['input_field', className].filter(Boolean).join(' ')

  if (multiline) {
    return (
      <textarea
        className={inputClassName}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    )
  }

  return (
    <input
      className={inputClassName}
      aria-label={ariaLabel}
      placeholder={placeholder}
      type={type}
      value={value}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

export default Input
