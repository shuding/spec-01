import { RadioGroup } from "@/registry/hardware/ui/radio-group"

export default function RadioGroupDemo() {
  return (
    <>
      <RadioGroup label="Sync source" options={["Internal", "MIDI", "USB"]} defaultValue="Internal" />
    </>
  )
}
