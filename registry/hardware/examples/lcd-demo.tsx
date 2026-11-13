import { Lcd, LcdDigits } from "@/registry/hardware/ui/lcd"

export default function LCDDemo() {
  return (
    <>
      <div data-lcd-demo>
        <Lcd tag="Tempo">
          <LcdDigits value="128.0" />
        </Lcd>
        <Lcd tag="Status">Synced to MIDI clock</Lcd>
        <Lcd tag="Battery" size="sm">
          <LcdDigits value="82%" />
        </Lcd>
        <Lcd tag="Timer" size="lg">
          <LcdDigits value="04:32" />
        </Lcd>
      </div>
    </>
  )
}
