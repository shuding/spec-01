import { FlatKnob } from "@/registry/hardware/ui/flat-knob"

export default function FlatKnobDemo() {
  return (
    <>
      <FlatKnob label="Tone" color="blue" defaultValue={30} />
      <FlatKnob label="Drive" color="orange" defaultValue={72} />
      <FlatKnob label="Space" color="white" defaultValue={50} />
      <FlatKnob label="Mix" color="green" defaultValue={18} />
    </>
  )
}
