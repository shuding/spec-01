import * as React from "react"
import { DateSetter } from "@/registry/hardware/ui/date-setter"
import { DatePicker as SdkDatePicker, DatePickerContent, DatePickerInput, DatePickerTrigger } from "@ui-sdk/react/date-picker"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Icon } from "@/registry/hardware/ui/icon"

// The date picker opens the calendar's date setter: its LCD and knurled jog
// wheel. Turn the wheel to change the field that's blinking, press its
// center to move to the next field; the date fills in as it turns.
function DatePicker({ label, defaultValue }: { label: string; defaultValue: string }) {
  const [value, setValue] = React.useState<string | null>(defaultValue)
  return (
    <SdkDatePicker value={value} onValueChange={(next) => setValue(typeof next === "string" ? next : null)}>
      <Field data-kit="field">
        <FieldLabel data-kit="label">{label}</FieldLabel>
        <div data-kit="input-group">
          <DatePickerInput data-kit="input" aria-label={label} />
          <DatePickerTrigger data-kit="input-addon" aria-label="Choose date">
            <Icon name="calendar" />
          </DatePickerTrigger>
        </div>
      </Field>
      <DatePickerContent data-kit="popover" align="start" sideOffset={14}>
        <div data-kit="popover-surface" data-size="date-device">
          <DateSetter label={label} value={value ?? defaultValue} onValueChange={setValue} />
        </div>
      </DatePickerContent>
    </SdkDatePicker>
  )
}

export { DatePicker }
