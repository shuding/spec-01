import { Checkbox } from "@/registry/hardware/ui/checkbox"

export default function CheckboxDemo() {
  return (
    <>
      <Checkbox label="Sync" defaultChecked />
      <Checkbox label="Loop" />
      <Checkbox label="Metro" />
    </>
  )
}
