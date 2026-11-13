import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea as SdkTextarea } from "@ui-sdk/react/textarea"

function Textarea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <Field data-kit="field">
      <FieldLabel data-kit="label">{label}</FieldLabel>
      <SdkTextarea data-kit="input" data-multiline="" placeholder={placeholder} />
    </Field>
  )
}

export { Textarea }
