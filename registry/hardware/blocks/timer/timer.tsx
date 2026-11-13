import * as React from "react"
import { Button } from "@/registry/hardware/ui/button"
import { Checkbox } from "@/registry/hardware/ui/checkbox"
import { Icon } from "@/registry/hardware/ui/icon"
import { SlideSwitch } from "@/registry/hardware/ui/slide-switch"
import { haptic } from "@/registry/hardware/lib/haptics"
import { Device } from "@/registry/hardware/ui/device"
import { Lcd, LcdDigits } from "@/registry/hardware/ui/lcd"

const full = 60 * 60

// A kitchen timer. Drag round the dial to set up to an hour; a wedge in the
// key color shows the time left and shrinks as it runs. At zero it beeps and
// its LED flashes until you reset it.
function Timer() {
  const [set, setSet] = React.useState(15 * 60)
  const [left, setLeft] = React.useState(15 * 60)
  const [running, setRunning] = React.useState(false)
  const [chime, setChime] = React.useState(true)
  const done = left <= 0 && set > 0
  const dial = React.useRef<HTMLDivElement>(null)
  const audio = React.useRef<AudioContext | null>(null)

  React.useEffect(() => {
    if (!running) return
    let last = performance.now()
    let id = requestAnimationFrame(function tick(now) {
      setLeft((t) => Math.max(0, t - (now - last) / 1000))
      last = now
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [running])

  React.useEffect(() => {
    if (!done || !running) return
    setRunning(false)
    haptic("success")
    if (!chime || !audio.current) return
    const ctx = audio.current
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 1320
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.3)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.3 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.22)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.3)
      osc.stop(ctx.currentTime + i * 0.3 + 0.25)
    }
  }, [done, running, chime])

  const setFrom = (event: React.PointerEvent) => {
    const box = dial.current!.getBoundingClientRect()
    const angle = Math.atan2(
      event.clientX - box.left - box.width / 2,
      -(event.clientY - box.top - box.height / 2),
    )
    const minutes = Math.round((((angle * 180) / Math.PI + 360) % 360) / 6)
    const seconds = Math.max(60, minutes * 60)
    // A tick at each minute the dial is turned through.
    if (seconds !== set) haptic("selection")
    setSet(seconds)
    setLeft(seconds)
    setRunning(false)
  }

  const minutes = Math.floor(left / 60)
  const seconds = Math.floor(left % 60)
  const share = left / full

  return (
    <Device model="TM-1" name="Timer" on={running || done}>
      <div data-timer>
        <div
          ref={dial}
          data-timer-dial
          data-done={done || undefined}
          role="slider"
          tabIndex={0}
          aria-label="Time"
          aria-valuemin={1}
          aria-valuemax={60}
          aria-valuenow={Math.ceil(left / 60)}
          aria-valuetext={`${minutes} minutes ${seconds} seconds`}
          style={{ "--share": share } as React.CSSProperties}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setFrom(event)
          }}
          onPointerMove={(event) => event.buttons && setFrom(event)}
          onKeyDown={(event) => {
            const by = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key]
            if (!by) return
            event.preventDefault()
            const next = Math.min(full, Math.max(60, (Math.round(left / 60) + by) * 60))
            if (next !== set) haptic("selection")
            setSet(next)
            setLeft(next)
          }}
        >
          <span data-timer-wedge aria-hidden />
          <svg data-timer-scale viewBox="-100 -100 200 200" aria-hidden>
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i * 6 * Math.PI) / 180
              const inner = i % 5 === 0 ? 85 : 89
              return (
                <line
                  key={i}
                  x1={Math.sin(a) * inner}
                  y1={-Math.cos(a) * inner}
                  x2={Math.sin(a) * 95}
                  y2={-Math.cos(a) * 95}
                  data-major={i % 5 === 0 || undefined}
                />
              )
            })}
          </svg>
          {[0, 10, 20, 30, 40, 50].map((m) => (
            <span key={m} data-timer-number style={{ "--m": m } as React.CSSProperties} aria-hidden>
              {m}
            </span>
          ))}
          <span data-timer-hub aria-hidden />
        </div>
        <div data-timer-middle>
          <div data-timer-lcd-row>
            <Lcd data-timer-lcd size="lg" tag={done ? "Done" : running ? "Running" : "Set"} aria-live="off">
              <LcdDigits
                data-done={done || undefined}
                value={`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
              />
            </Lcd>
            <div data-timer-start>
              <Button
                tone="primary"
                round
                aria-label={running ? "Pause" : "Start"}
                onClick={() => {
                  audio.current ??= new AudioContext()
                  void audio.current.resume()
                  if (done) setLeft(set)
                  setRunning(!running)
                }}
              >
                <Icon name={running ? "pause" : "play"} />
              </Button>
            </div>
          </div>
          <div data-timer-row>
            <SlideSwitch
              label="Preset"
              options={["1", "5", "15", "25", "45"]}
              defaultValue="15"
              onValueChange={(value) => {
                const next = Number(value) * 60
                setSet(next)
                setLeft(next)
                setRunning(false)
              }}
            />
            <div data-timer-small>
              <Button
                round
                aria-label="Reset"
                onClick={() => {
                  setRunning(false)
                  setLeft(set)
                }}
              >
                <Icon name="restart" />
              </Button>
              <Checkbox label="Chime" icon="bell" defaultChecked onCheckedChange={setChime} />
            </div>
          </div>
        </div>
      </div>
    </Device>
  )
}

export { Timer }
