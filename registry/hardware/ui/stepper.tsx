import { haptic } from "@/registry/hardware/lib/haptics"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@ui-sdk/react/number-input"
import { Icon } from "@/registry/hardware/ui/icon"

function Stepper({ label, defaultValue }: { label: string; defaultValue: number }) {
  return (
    // A tick per step, pressed once or held to repeat.
    <NumberInput defaultValue={defaultValue} min={0} max={999} onValueChange={() => haptic("selection")}>
      <Field data-kit="field">
        <FieldLabel data-kit="label">{label}</FieldLabel>
        <NumberInputGroup data-kit="stepper">
          <NumberInputDecrement data-kit="button" data-tone="secondary" aria-label="Decrease">
            <Icon name="minus" />
          </NumberInputDecrement>
          <NumberInputControl data-kit="stepper-input" aria-label={label} />
          <NumberInputIncrement data-kit="button" data-tone="secondary" aria-label="Increase">
            <Icon name="plus" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </Field>
    </NumberInput>
  )
}

export { Stepper }
