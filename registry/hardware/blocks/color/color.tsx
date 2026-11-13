import * as React from "react"
import { formatColor, parseColor } from "@ui-sdk/react/color"
import { Button } from "@/registry/hardware/ui/button"
import { FlatKnob } from "@/registry/hardware/ui/flat-knob"
import { ModeDial } from "@/registry/hardware/ui/mode-dial"
import { haptic } from "@/registry/hardware/lib/haptics"
import { Display } from "@/registry/hardware/ui/display"
import { Device, DevicePlate } from "@/registry/hardware/ui/device"

type Lch = { l: number; c: number; h: number }

const maxChroma = 0.37
const css = ({ l, c, h }: Lch) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`
const hex = (color: Lch) => formatColor(parseColor(css(color))!, "hex")

const modes = ["Mono", "Ana", "Comp", "Tri"]

// Five colors that go with the one being set, by the chosen harmony.
function harmony(color: Lch, mode: string): Lch[] {
  const turn = (by: number, l = color.l, c = color.c) => ({ l, c, h: (color.h + by + 360) % 360 })
  if (mode === "Mono") return [0.3, 0.45, color.l, 0.8, 0.92].map((l) => ({ ...color, l, c: color.c * (l > 0.85 ? 0.5 : 1) }))
  if (mode === "Ana") return [-40, -20, 0, 20, 40].map((by) => turn(by))
  if (mode === "Comp") return [turn(0), turn(0, color.l * 0.7), turn(180), turn(180, Math.min(0.92, color.l * 1.25), color.c * 0.6), turn(0, 0.94, color.c * 0.2)]
  return [turn(0), turn(120), turn(240), turn(0, color.l * 0.65), turn(0, 0.94, color.c * 0.2)]
}

// A handheld color instrument, held in landscape like a game console: the
// screen in the middle shows the color on a ring of hues, its OKLCH numbers
// and a palette that goes with it. The harmony dial on the left wing picks
// the palette, and RANDOM under it picks a color; the three encoders stepped
// up the right wing set lightness, chroma and hue, and COPY under them puts
// the color on the clipboard.
function ColorInstrument() {
  const [color, setColor] = React.useState<Lch>({ l: 0.68, c: 0.18, h: 47 })
  const [mode, setMode] = React.useState("Ana")
  const [copied, setCopied] = React.useState(false)
  const palette = harmony(color, mode)

  // A color picked at random, kept in the range that reads well on screen.
  const random = () =>
    setColor({ l: 0.55 + Math.random() * 0.3, c: 0.08 + Math.random() * 0.2, h: Math.random() * 360 })

  const copy = () => {
    void navigator.clipboard?.writeText(css(color))
    haptic("success")
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Device model="CX-1" name="Color" plate="none">
      <div data-color-body>
        <div data-color-wing="left">
          <section data-section data-named aria-label="Harmony" data-color-dial>
            <ModeDial label="Harmony" sweep={150} options={modes.map((m) => ({ value: m, label: m }))} value={mode} onValueChange={setMode} />
          </section>
          <Button onClick={random} data-color-random>
            Random
          </Button>
        </div>

        <div data-color-center>
          <Display aspect="16 / 9">
            <div data-color-screen style={{ "--now": css(color) } as React.CSSProperties}>
              <svg data-color-ring viewBox="-50 -50 100 100" aria-hidden>
                {/* The swatch's glow is an SVG filter: Safari ignores CSS
                    filters on an SVG's shapes. */}
                <defs>
                  <filter id="color-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={css(color)} />
                  </filter>
                </defs>
                {Array.from({ length: 36 }, (_, i) => {
                  const h = i * 10
                  const angle = ((h - 90) * Math.PI) / 180
                  const near = Math.abs(((color.h - h + 540) % 360) - 180) < 5
                  return (
                    <circle
                      key={h}
                      cx={Math.cos(angle) * 42}
                      cy={Math.sin(angle) * 42}
                      r={near ? 4.2 : 2.2}
                      fill={css({ l: color.l, c: color.c, h })}
                      stroke={near ? "#f2f2ee" : "none"}
                      strokeWidth={near ? 1 : 0}
                    />
                  )
                })}
                <circle r="27" fill={css(color)} filter="url(#color-glow)" />
              </svg>
              <div data-color-numbers>
                <span data-color-tag>OKLCH</span>
                <dl>
                  <div>
                    <dt>L</dt>
                    <dd>{Math.round(color.l * 100)}</dd>
                  </div>
                  <div>
                    <dt>C</dt>
                    <dd>{color.c.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt>H</dt>
                    <dd>{String(Math.round(color.h)).padStart(3, "0")}</dd>
                  </div>
                </dl>
                <span data-color-hex>{hex(color)}</span>
                <div data-color-palette aria-hidden>
                  {palette.map((swatch, i) => (
                    <i key={i} style={{ background: css(swatch) }} />
                  ))}
                </div>
              </div>
            </div>
          </Display>
          <DevicePlate model="CX-1" name="Color" under />
        </div>

        <div data-color-wing="right">
          <div data-color-encoders>
            <FlatKnob
              label="Lightness"
              color="white"
              value={Math.round(color.l * 100)}
              onValueChange={(v) => setColor((c) => ({ ...c, l: v / 100 }))}
            />
            <FlatKnob
              label="Chroma"
              color="green"
              value={Math.round((color.c / maxChroma) * 100)}
              onValueChange={(v) => setColor((c) => ({ ...c, c: (v / 100) * maxChroma }))}
            />
            <FlatKnob
              label="Hue"
              color="orange"
              value={Math.round((color.h / 360) * 100)}
              onValueChange={(v) => setColor((c) => ({ ...c, h: (v / 100) * 360 }))}
            />
          </div>
          <Button tone="primary" onClick={copy} data-color-copy>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </Device>
  )
}

export { ColorInstrument }
