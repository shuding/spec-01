import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Radio, RadioGroup as SdkRadioGroup, RadioIndicator } from "@ui-sdk/react/radio"

function RadioGroup({
  label,
  options,
  defaultValue,
  onValueChange,
}: {
  label: string
  options: string[]
  defaultValue: string
  onValueChange?: (value: string) => void
}) {
  return (
    <Field data-kit="field">
      <FieldLabel data-kit="label">{label}</FieldLabel>
      <SdkRadioGroup
        data-kit="radio-group"
        defaultValue={defaultValue}
        onValueChange={onValueChange && ((value) => value && onValueChange(String(value)))}
      >
        {options.map((option) => (
          <label key={option} data-kit="check" data-value={option}>
            <Radio value={option} data-kit="radio">
              <RadioIndicator data-kit="radio-indicator" keepMounted />
            </Radio>
            <span data-kit="label">{option}</span>
          </label>
        ))}
      </SdkRadioGroup>
    </Field>
  )
}

export { RadioGroup }
