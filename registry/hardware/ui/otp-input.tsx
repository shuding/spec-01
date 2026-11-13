import { Field, FieldLabel } from "@ui-sdk/react/field"
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@ui-sdk/react/otp-input"

function OTP({ label, length = 6 }: { label: string; length?: number }) {
  const half = length / 2
  return (
    <Field data-kit="field">
      <FieldLabel data-kit="label">{label}</FieldLabel>
      <OTPInput maxLength={length} data-kit="otp">
        <OTPInputGroup data-kit="otp-group">
          {Array.from({ length: half }, (_, index) => (
            <OTPInputSlot key={index} index={index} data-kit="otp-slot" />
          ))}
        </OTPInputGroup>
        <OTPInputSeparator data-kit="otp-separator">–</OTPInputSeparator>
        <OTPInputGroup data-kit="otp-group">
          {Array.from({ length: half }, (_, index) => (
            <OTPInputSlot key={index} index={index + half} data-kit="otp-slot" />
          ))}
        </OTPInputGroup>
      </OTPInput>
    </Field>
  )
}

export { OTP }
