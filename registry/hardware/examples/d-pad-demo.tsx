import * as React from "react"
import { DPad } from "@/registry/hardware/ui/dpad"

export default function DPadDemo() {
  const [pos, setPos] = React.useState({ x: 2, y: 1 })
  // The dot wraps round the 5x3 grid: off one edge, on at the other.
  const move = (dx: number, dy: number) => setPos((p) => ({ x: (p.x + dx + 5) % 5, y: (p.y + dy + 3) % 3 }))
  return (
    <div data-dpad-demo>
      <div data-dpad-grid aria-hidden>
        {Array.from({ length: 15 }, (_, i) => (
          <i key={i} data-on={i === pos.y * 5 + pos.x || undefined} />
        ))}
      </div>
      <DPad
        label="Move"
        onUp={() => move(0, -1)}
        onDown={() => move(0, 1)}
        onLeft={() => move(-1, 0)}
        onRight={() => move(1, 0)}
      />
    </div>
  )
}
