import * as React from "react"
import { dateParts, daysInMonth, isoDate, weekday as weekdayOf } from "@ui-sdk/core/date"
import { haptic } from "@/registry/hardware/lib/haptics"

type Field = "year" | "month" | "day"
const fields: Field[] = ["year", "month", "day"]
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
// The date math is UI SDK's (core/date). It counts months 1 to 12; the
// fields here count them 0 to 11, so the helpers convert at the edge.
const daysIn = (year: number, month: number) => daysInMonth(year, month + 1)

// A date set the way devices set their clocks: one field at a time, the
// active one blinking on the screen. Turn the wheel (drag it round, scroll
// on it, or press up and down) to change the field; press its center to move
// to the next one. Each field is a spinbutton, so keyboards and screen
// readers get the same model.
const parse = (iso: string) => {
  const { year, month, day } = dateParts(iso) ?? { year: 2026, month: 1, day: 1 }
  return { year, month: month - 1, day }
}
const format = ({ year, month, day }: { year: number; month: number; day: number }) => isoDate(year, month + 1, day)!

function DateSetter({
  defaultValue,
  value,
  onValueChange,
  label = "Date",
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  label?: string
}) {
  const [date, setDate] = React.useState(() => parse(value ?? defaultValue ?? "2026-01-01"))
  // A controlled value moves the fields when it changes from outside.
  React.useEffect(() => {
    if (value && value !== format(date)) setDate(parse(value))
  }, [value])
  const reported = React.useRef(format(date))
  React.useEffect(() => {
    const next = format(date)
    if (next === reported.current) return
    reported.current = next
    onValueChange?.(next)
  }, [date])
  const [active, setActive] = React.useState<Field>("day")
  const [turn, setTurn] = React.useState(0)
  const spins = React.useRef<Record<Field, HTMLSpanElement | null>>({ year: null, month: null, day: null })

  // Every step, turned, scrolled or keyed, is one detent of the wheel.
  const step = (by: number, field = active) => {
    haptic("selection")
    setTurn((t) => t + by * 15)
    setDate((current) => {
      let { year, month, day } = current
      if (field === "year") year = Math.min(2099, Math.max(1970, year + by))
      if (field === "month") month = (month + by + 12) % 12
      if (field === "day") day = ((day - 1 + by + daysIn(year, month)) % daysIn(year, month)) + 1
      return { year, month, day: Math.min(day, daysIn(year, month)) }
    })
  }

  const advance = () => {
    const next = fields[(fields.indexOf(active) + 1) % fields.length]
    setActive(next)
    spins.current[next]?.focus()
  }

  const keys = (field: Field) => (event: React.KeyboardEvent) => {
    const by = { ArrowUp: 1, ArrowRight: 0, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key]
    if (event.key === "Enter") {
      event.preventDefault()
      advance()
    } else if (by) {
      event.preventDefault()
      step(by, field)
    }
  }

  // Dragging round the wheel: every 15 degrees is one step.
  const wheel = React.useRef<{ angle: number; rest: number } | null>(null)
  const angleOf = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    return (Math.atan2(event.clientY - box.top - box.height / 2, event.clientX - box.left - box.width / 2) * 180) / Math.PI
  }

  const { year, month, day } = date
  const weekday = weekdayOf(format(date))
  const first = weekdayOf(isoDate(year, month + 1, 1)!)
  const values: Record<Field, { text: string; now: number; min: number; max: number; spoken: string }> = {
    year: { text: String(year), now: year, min: 1970, max: 2099, spoken: String(year) },
    month: { text: String(month + 1).padStart(2, "0"), now: month + 1, min: 1, max: 12, spoken: monthNames[month] },
    day: { text: String(day).padStart(2, "0"), now: day, min: 1, max: daysIn(year, month), spoken: String(day) },
  }

  return (
    <div data-kit="date-setter" role="group" aria-label={label}>
      <div data-kit="date-lcd">
        <div data-kit="date-lcd-row">
          <span data-kit="date-lcd-tag">Set date</span>
          <span data-kit="date-lcd-tag">{weekdayNames[weekday]}</span>
        </div>
        <div data-kit="date-lcd-fields">
          {fields.map((field, i) => (
            <React.Fragment key={field}>
              {i > 0 && <span data-kit="date-lcd-sep" aria-hidden>·</span>}
              <span
                ref={(el) => {
                  spins.current[field] = el
                }}
                role="spinbutton"
                tabIndex={0}
                aria-label={field}
                aria-valuenow={values[field].now}
                aria-valuemin={values[field].min}
                aria-valuemax={values[field].max}
                aria-valuetext={values[field].spoken}
                data-kit="date-lcd-field"
                data-active={field === active || undefined}
                onFocus={() => setActive(field)}
                onClick={() => setActive(field)}
                onKeyDown={keys(field)}
              >
                {values[field].text}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div data-kit="date-lcd-month" aria-hidden>
          {Array.from({ length: first }, (_, i) => (
            <i key={`blank-${i}`} data-blank />
          ))}
          {Array.from({ length: daysIn(year, month) }, (_, i) => (
            <i key={i} data-on={i + 1 === day || undefined} />
          ))}
          {/* Always six weeks, so the screen keeps its height month to month. */}
          {Array.from({ length: 42 - first - daysIn(year, month) }, (_, i) => (
            <i key={`after-${i}`} data-blank />
          ))}
        </div>
      </div>

      <div
        data-kit="jog"
        style={{ "--turn": `${turn}deg` } as React.CSSProperties}
        onWheel={(event) => step(event.deltaY < 0 ? 1 : -1)}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return
          event.currentTarget.setPointerCapture(event.pointerId)
          wheel.current = { angle: angleOf(event), rest: 0 }
        }}
        onPointerMove={(event) => {
          const drag = wheel.current
          if (!drag) return
          const angle = angleOf(event)
          let delta = angle - drag.angle
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360
          drag.angle = angle
          drag.rest += delta
          while (Math.abs(drag.rest) >= 15) {
            step(drag.rest > 0 ? 1 : -1)
            drag.rest -= Math.sign(drag.rest) * 15
          }
        }}
        onPointerUp={() => {
          wheel.current = null
        }}
      >
        <span data-kit="jog-ring" aria-hidden />
        <button type="button" data-kit="jog-center" aria-label={`Next field, after ${active}`} onClick={advance}>
          Set
        </button>
      </div>
    </div>
  )
}

export { DateSetter }
