import { ToggleGroup } from "@/registry/hardware/ui/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <>
      <ToggleGroup label="Alignment" options={["left", "center", "right"]} defaultValue="left" />
    </>
  )
}
