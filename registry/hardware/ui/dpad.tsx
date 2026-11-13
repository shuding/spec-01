import * as React from "react"
import { Button } from "@ui-sdk/react/button"

// A D-pad: one matte cross-shaped cap in a round well, with a shallow dish
// at its center and four press zones. Pressing a direction rocks the whole
// cap on its center pivot, tilting it a few degrees toward that arm. Each
// zone is its own button (a UI SDK button), and arrow keys press them while
// the pad has focus.
function DPad({
  label,
  onUp,
  onDown,
  onLeft,
  onRight,
}: {
  label: string
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
}) {
  const handlers = { up: onUp, down: onDown, left: onLeft, right: onRight }
  const names = { up: "Up", down: "Down", left: "Left", right: "Right" }
  return (
    <div
      data-kit="dpad"
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        const dir = ({ ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } as const)[
          event.key as "ArrowUp"
        ]
        if (!dir) return
        event.preventDefault()
        handlers[dir]?.()
      }}
    >
      <span data-kit="dpad-well" aria-hidden />
      <span data-kit="dpad-shadow" aria-hidden>
        <span data-kit="dpad-base" />
      </span>
      <span data-kit="dpad-cap" aria-hidden>
        <span data-kit="dpad-dish" />
      </span>
      {(["up", "left", "right", "down"] as const).map((dir) => (
        <Button key={dir} data-kit="dpad-zone" data-dir={dir} aria-label={names[dir]} onClick={() => handlers[dir]?.()}>
          <span data-kit="dpad-arrow" />
        </Button>
      ))}
    </div>
  )
}

export { DPad }
