import { Stepper } from "@/registry/hardware/ui/stepper"

export default function NumberStepperDemo() {
  return (
    <>
      <Stepper label="Tempo" defaultValue={120} />
    </>
  )
}
