import { Meter } from "@/registry/hardware/ui/meter"

export default function MeterDemo() {
  return (
    <>
      <Meter label="CPU" value={68} />
    </>
  )
}
