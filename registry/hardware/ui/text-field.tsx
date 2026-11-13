import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function TextField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <Field data-kit="field">
      <FieldLabel data-kit="label">{label}</FieldLabel>
      <Input data-kit="input" defaultValue={defaultValue} spellCheck={false} />
    </Field>
  )
}

export { TextField }
