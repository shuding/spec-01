import * as React from "react"
import { crosses, haptic } from "@/registry/hardware/lib/haptics"
import { NumberInput, NumberInputControl, NumberInputScrubArea } from "@ui-sdk/react/number-input"

// The tick ring round a knob: 28 ticks over a 270deg sweep, every ninth
// heavier, those up to the value lit. It's SVG rather than a paint worklet,
// so it draws the same in every browser; the strokes stay 1px and 2px at
// any dial size.
const knobTicks = 27

function KnobTicks({ lit }: { lit: number }) {
  return (
    <svg data-kit="knob-ticks" viewBox="-50 -50 100 100" aria-hidden>
      {Array.from({ length: knobTicks + 1 }, (_, i) => {
        const angle = ((-135 + (i / knobTicks) * 270 - 90) * Math.PI) / 180
        return (
          <line
            key={i}
            x1={Math.cos(angle) * 40}
            y1={Math.sin(angle) * 40}
            x2={Math.cos(angle) * 50}
            y2={Math.sin(angle) * 50}
            data-major={i % 9 === 0 || undefined}
            data-lit={i / knobTicks <= lit || undefined}
          />
        )
      })}
    </svg>
  )
}

function FlatKnob({
  label,
  color,
  value: controlled,
  defaultValue = 0,
  onValueChange,
}: {
  label: string
  color: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}) {
  const [stored, setStored] = React.useState<number | null>(defaultValue)
  const value = controlled ?? stored
  const setValue = (next: number | null) => {
    setStored(next)
    if (next === null) return
    // Twenty detents across the turn, like an encoder's clicks.
    if (crosses(value ?? 0, next, 5)) haptic("selection")
    onValueChange?.(next)
  }
  const share = (value ?? 0) / 100
  return (
    <NumberInput min={0} max={100} value={value} onValueChange={setValue}>
      <div
        data-kit="knob"
        data-color={color}
        style={{ "--turn": `${share * 270 - 135}deg`, "--lit": share } as React.CSSProperties}
      >
        <NumberInputScrubArea data-kit="knob-dial" orientation="vertical" pixelsPerStep={2}>
          <KnobTicks lit={share} />
          <span data-kit="knob-cap" />
        </NumberInputScrubArea>
        <NumberInputControl data-kit="knob-readout" aria-label={label} />
        <span data-kit="label">{label}</span>
      </div>
    </NumberInput>
  )
}

export { FlatKnob }
