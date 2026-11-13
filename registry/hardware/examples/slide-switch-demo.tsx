import { SlideSwitch } from "@/registry/hardware/ui/slide-switch"

export default function SlideSwitchDemo() {
  return (
    <>
      <div data-switch-demo>
        <SlideSwitch label="Output" orientation="vertical" side="start" options={["Main", "Cue", "Both"]} defaultValue="Cue" />
        <SlideSwitch label="Quality" options={["Lo", "Mid", "Hi"]} defaultValue="Mid" />
        <SlideSwitch label="Input" orientation="vertical" options={["Line", "Mic", "USB"]} defaultValue="Line" />
      </div>
    </>
  )
}
