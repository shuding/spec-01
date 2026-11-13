import * as React from "react"
import { haptic } from "@/registry/hardware/lib/haptics"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"

// A select drawn as a picker wheel: options sit on a drum that turns behind
// a fixed lens, and whichever one stops in the lens is chosen. Scroll, swipe,
// drag it with a mouse, click an option, or use the arrow keys and typing,
// which the listbox already handles.
const wheelRow = 32

const wheelRadius = wheelRow / ((22 * Math.PI) / 180)

const ridgePitch = 4

// Ridges around the visible half of the drum, at a fixed pitch along it.
const ridges = Array.from({ length: Math.ceil((Math.PI * wheelRadius) / ridgePitch) + 2 }, (_, i) => i)

function Select({
  label,
  options,
  defaultValue,
}: {
  label: string
  options: { value: string; label: string }[]
  defaultValue: string
}) {
  const [value, setValue] = React.useState(defaultValue)
  const list = React.useRef<HTMLDivElement>(null)
  const settle = React.useRef(0)
  const drag = React.useRef<{ y: number; top: number; moved: boolean } | null>(null)
  const dragged = React.useRef(false)
  const ready = React.useRef(false)
  const fromScroll = React.useRef(false)
  const target = React.useRef<number | null>(null)
  const chosen = React.useRef(value)
  chosen.current = value
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  // The rails' ridges and the row faces, repainted as the wheel turns, found
  // once rather than queried on every scroll event.
  const parts = React.useRef<{ ridges: HTMLElement[]; faces: HTMLElement[] } | null>(null)
  const paint = () => {
    const el = list.current
    if (!el) return
    parts.current ??= {
      ridges: [...el.parentElement!.querySelectorAll<HTMLElement>("[data-ridge]")],
      faces: [...el.querySelectorAll<HTMLElement>('[data-kit="wheel-face"]')],
    }
    const at = el.scrollTop / wheelRow
    // The ridges on the rails sit around the drum's curve, so they crowd and
    // thin toward its top and bottom as it turns away.
    const phase = ((el.scrollTop % ridgePitch) + ridgePitch) % ridgePitch
    const half = ridges.length / 2
    for (const ridge of parts.current.ridges) {
      const angle = ((Number(ridge.dataset.ridge) - half) * ridgePitch - phase) / wheelRadius
      const visible = Math.abs(angle) < Math.PI / 2
      ridge.style.transform = visible
        ? `translateY(${(wheelRadius * Math.sin(angle)).toFixed(2)}px) scaleY(${Math.cos(angle).toFixed(3)})`
        : "scaleY(0)"
      ridge.style.opacity = visible ? (0.2 + 0.8 * Math.cos(angle)).toFixed(2) : "0"
    }
    parts.current.faces.forEach((face, i) => {
      const d = i - at
      const angle = Math.max(-90, Math.min(90, d * 22))
      const rad = (angle * Math.PI) / 180
      face.style.transform = `perspective(500px) translateY(${wheelRadius * Math.sin(rad) - d * wheelRow}px) translateZ(${wheelRadius * (Math.cos(rad) - 1)}px) rotateX(${-angle}deg)`
      face.style.opacity = String(Math.max(0, 1 - Math.abs(d) * 0.28))
    })
  }

  React.useLayoutEffect(() => {
    const el = list.current!
    if (fromScroll.current) {
      fromScroll.current = false
      return paint()
    }
    if (Math.abs(el.scrollTop - index * wheelRow) < 1 || drag.current) {
      ready.current = true
      return paint()
    }
    target.current = index * wheelRow
    el.scrollTo({ top: target.current, behavior: ready.current ? "smooth" : "instant" })
    ready.current = true
    paint()
  }, [index])

  // The row in the lens is chosen as it passes, while the wheel turns.
  const chooseCentered = () => {
    const el = list.current
    if (!el) return
    const option = options[Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / wheelRow)))]
    if (option.value === chosen.current) return
    chosen.current = option.value
    haptic("selection")
    fromScroll.current = true
    setValue(option.value)
  }

  // Once the wheel stops, keyboard focus joins the row in the lens, so arrow
  // keys continue from there. Moving it mid-turn would make the listbox
  // scroll to the focused row and fight the drag.
  const focusCentered = () => {
    const el = list.current
    if (!el || !el.contains(document.activeElement)) return
    const row = el.querySelectorAll<HTMLElement>('[role="option"]')[Math.round(el.scrollTop / wheelRow)]
    if (row && row !== document.activeElement) row.focus({ preventScroll: true })
  }

  // Scroll events can come faster than frames while the wheel is flung, so
  // the repaint runs at most once a frame.
  const painting = React.useRef(0)
  const onScroll = () => {
    if (!painting.current)
      painting.current = requestAnimationFrame(() => {
        painting.current = 0
        paint()
      })
    const el = list.current!
    // A scroll the wheel started itself, toward a chosen row, passes over
    // others on the way; only scrolls the person makes choose as they pass.
    if (target.current !== null) {
      if (Math.abs(el.scrollTop - target.current) < 1) target.current = null
    } else chooseCentered()
    clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      target.current = null
      if (drag.current) return
      chooseCentered()
      focusCentered()
    }, 120)
  }

  return (
    <Field data-kit="field">
      <FieldLabel data-kit="label">{label}</FieldLabel>
      <div data-kit="wheel-frame" style={{ "--wheel-row": `${wheelRow}px` } as React.CSSProperties}>
        {["left", "right"].map((side) => (
          <div key={side} data-kit="wheel-rail" data-side={side} aria-hidden>
            {ridges.map((i) => (
              <i key={i} data-ridge={i} />
            ))}
          </div>
        ))}
        <Listbox
          ref={list}
          data-kit="wheel"
          value={value}
          onValueChange={(next) => next && setValue(next)}
          onScroll={onScroll}
          onPointerDown={(event) => {
            dragged.current = false
            if (event.pointerType !== "mouse" || event.button !== 0) return
            drag.current = { y: event.clientY, top: event.currentTarget.scrollTop, moved: false }
          }}
          onPointerMove={(event) => {
            const current = drag.current
            if (!current) return
            const dy = event.clientY - current.y
            const el = event.currentTarget
            if (!current.moved) {
              if (Math.abs(dy) < 3) return
              current.moved = true
              el.setPointerCapture(event.pointerId)
              el.dataset.dragging = ""
            }
            el.scrollTop = current.top - dy
          }}
          onPointerUp={(event) => {
            const current = drag.current
            drag.current = null
            if (!current?.moved) return
            const el = event.currentTarget
            delete el.dataset.dragging
            const option =
              options[Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / wheelRow)))]
            el.scrollTo({ top: options.indexOf(option) * wheelRow, behavior: "smooth" })
            setValue(option.value)
            dragged.current = true
          }}
          onMouseDown={(event) => {
            // Focusing a row on press scrolls it into view at once; focus it
            // without scrolling, and let the wheel roll to it instead.
            const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]')
            if (!option) return
            event.preventDefault()
            option.focus({ preventScroll: true })
          }}
          onClickCapture={(event) => {
            // WebKit sends the click to the row the drag started on.
            if (!dragged.current) return
            dragged.current = false
            event.preventDefault()
            event.stopPropagation()
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
        >
          {options.map((option) => (
            <ListboxItem key={option.value} value={option.value} data-kit="wheel-item">
              <span data-kit="wheel-face">{option.label}</span>
            </ListboxItem>
          ))}
        </Listbox>
      </div>
    </Field>
  )
}

export { Select }
