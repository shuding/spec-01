import * as React from "react"
import { spatialMove } from "@ui-sdk/core"
import { Button } from "@/registry/hardware/ui/button"
import { Icon } from "@/registry/hardware/ui/icon"
import { FlatKnob } from "@/registry/hardware/ui/flat-knob"
import { Display } from "@/registry/hardware/ui/display"
import { Tabs } from "@/registry/hardware/ui/tabs"
import { SlideSwitch } from "@/registry/hardware/ui/slide-switch"
import { Device, DevicePlate } from "@/registry/hardware/ui/device"

const waves = { Sine: "sine", Tri: "triangle", Sqr: "square", Saw: "sawtooth" } as const
type Wave = keyof typeof waves

const notes = ["C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4"]
const steps = 16
const frequency = (note: string) => {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const name = note.slice(0, -1)
  const octave = Number(note.at(-1))
  return 440 * 2 ** ((names.indexOf(name) + (octave - 4) * 12 - 9) / 12)
}

// A phrase in every pattern to start from, as (step, row) pairs. Rows count
// down from C5 (0) to C4 (12): A4 is 3, G4 5, F4 7, E4 8, D4 10, B4 1.
const phrases: Record<string, [number, number][]> = {
  // A rising line, and B answering it.
  A: [[0, 12], [2, 8], [4, 5], [6, 8], [8, 3], [10, 5], [12, 8], [13, 5], [14, 3], [15, 0]],
  B: [[0, 5], [1, 8], [2, 12], [4, 3], [6, 5], [8, 0], [9, 3], [10, 5], [12, 8], [14, 12]],
  // A bassline that bounces off the low C, jumping the octave.
  C: [[0, 12], [2, 12], [3, 0], [4, 12], [6, 10], [8, 12], [10, 8], [11, 5], [12, 12], [14, 3], [15, 5]],
  // A C major arpeggio, up and back, then through F.
  D: [[0, 12], [1, 8], [2, 5], [3, 0], [4, 5], [5, 8], [6, 12], [7, 8], [8, 10], [9, 7], [10, 3], [11, 7], [12, 12], [13, 8], [14, 5], [15, 8]],
  // A minor: a run through A, C, D, E, G.
  E: [[0, 3], [2, 0], [3, 3], [4, 5], [6, 8], [7, 10], [8, 3], [10, 5], [12, 8], [14, 10], [15, 12]],
  // A syncopated hook: off the beat, with room around it.
  F: [[0, 8], [3, 8], [6, 5], [8, 8], [10, 3], [11, 5], [14, 0]],
  // Chord stabs on the beats: C, F, G, C.
  G: [[0, 12], [0, 8], [0, 5], [4, 7], [4, 3], [4, 0], [8, 10], [8, 5], [8, 1], [12, 12], [12, 8], [12, 5]],
  // A falling run from the top C, settling back down.
  H: [[0, 0], [1, 1], [2, 3], [3, 5], [4, 7], [5, 8], [6, 10], [7, 12], [8, 12], [10, 8], [12, 5], [14, 3]],
}
const patterns = ["A", "B", "C", "D", "E", "F", "G", "H"] as const
type Pattern = (typeof patterns)[number]
type Grid = boolean[][]
const empty = (): Grid => notes.map(() => Array<boolean>(steps).fill(false))
const written = (pattern: Pattern) => {
  const grid = empty()
  for (const [step, row] of phrases[pattern] ?? []) grid[row][step] = true
  return grid
}
const startingBank = () => Object.fromEntries(patterns.map((p) => [p, written(p)])) as Record<Pattern, Grid>

// A new phrase for the dice key, from the C major pentatonic on the roll
// (C, D, E, G, A), so whatever it writes sounds like a tune. It starts on the
// low C, leans on the beats, and moves mostly by small steps.
const pentatonic = notes.map((n, row) => (/^(C|D|E|G|A)\d$/.test(n) ? row : -1)).filter((row) => row >= 0)
function invent(): Grid {
  const grid = empty()
  let at = pentatonic.length - 1
  for (let step = 0; step < steps; step++) {
    const chance = step === 0 ? 1 : step % 4 === 0 ? 0.8 : step % 2 === 0 ? 0.5 : 0.25
    if (Math.random() > chance) continue
    at = Math.min(pentatonic.length - 1, Math.max(0, at + Math.round((Math.random() - 0.5) * 3.2)))
    grid[pentatonic[at]][step] = true
  }
  return grid
}

// A pocket groovebox: a piano roll on the screen with a bank of eight
// patterns on tabs over it, and a lane of step LEDs along the bottom of the screen
// that chases the playhead. Each cell is a toggle. Playing sweeps the open
// pattern and sounds each note through a small synth: an oscillator per
// note, through a resonant low-pass filter, with a short envelope. Tempo,
// cutoff and swing are encoders; the dice key writes a new phrase.
function MidiEditor() {
  const [bank, setBank] = React.useState(startingBank)
  const [pattern, setPattern] = React.useState<Pattern>("A")
  const [playing, setPlaying] = React.useState(false)
  const [step, setStep] = React.useState(-1)
  const [tempo, setTempo] = React.useState(50)
  const [cutoff, setCutoff] = React.useState(70)
  const [swing, setSwing] = React.useState(0)
  const [wave, setWave] = React.useState<OscillatorType>("triangle")
  const audio = React.useRef<AudioContext | null>(null)

  const grid = bank[pattern]
  const setGrid = (update: (grid: Grid) => Grid) =>
    setBank((current) => ({ ...current, [pattern]: update(current[pattern]) }))

  const bpm = Math.round(70 + (tempo / 100) * 110)
  // The filter sweeps from a muffled 200Hz to an open 9kHz, evenly by ear.
  const hertz = Math.round(200 * 2 ** ((cutoff / 100) * Math.log2(9000 / 200)))
  // Swing lengthens each even step and shortens the odd one after it, up to
  // a 3:1 shuffle.
  const shuffle = (swing / 100) * 0.5

  // The sequencer reads the newest settings each step without restarting.
  const latest = React.useRef({ grid, wave, bpm, hertz, shuffle })
  latest.current = { grid, wave, bpm, hertz, shuffle }

  const sound = (column: number) => {
    const ctx = audio.current!
    const { grid, wave, bpm, hertz } = latest.current
    const length = 60 / bpm / 4
    grid.forEach((row, r) => {
      if (!row[column]) return
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = wave
      osc.frequency.value = frequency(notes[r])
      filter.type = "lowpass"
      filter.Q.value = 7
      // Each note opens the filter a little and lets it fall back: a pluck.
      filter.frequency.setValueAtTime(Math.min(12000, hertz * 2.2), ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(hertz, ctx.currentTime + length * 0.9)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length * 1.6)
      osc.connect(filter).connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + length * 1.7)
    })
  }

  // Each step schedules the next, so tempo and swing apply from the next
  // step on, and the pattern keeps its place.
  React.useEffect(() => {
    if (!playing) return
    let column = -1
    let timer = 0
    const tick = () => {
      column = (column + 1) % steps
      setStep(column)
      sound(column)
      const { bpm, shuffle } = latest.current
      const base = (60 / bpm / 4) * 1000
      timer = window.setTimeout(tick, column % 2 === 0 ? base * (1 + shuffle) : base * (1 - shuffle))
    }
    tick()
    return () => clearTimeout(timer)
  }, [playing])

  const toggle = (row: number, column: number) =>
    setGrid((current) => current.map((cells, r) => (r === row ? cells.map((on, c) => (c === column ? !on : on)) : cells)))

  // The roll is one tab stop. Arrows move to the nearest cell on screen in
  // their direction, through UI SDK's spatialMove (Home and End go to the
  // first and last cell); the cell moved to takes the tab stop.
  const [active, setActive] = React.useState("0:0")
  const move = React.useMemo(() => spatialMove(), [])
  const onRollKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (!target.matches('[role="gridcell"]')) return
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="gridcell"]')].map((el) => ({ key: el.dataset.cell!, props: {}, el }))
    const from = items.find((item) => item.el === target)
    if (!from) return
    const key = move(event.nativeEvent, { from, items, rtl: false })
    const next = key && items.find((item) => item.key === key)
    if (!next) return
    event.preventDefault()
    setActive(key)
    next.el.focus()
  }

  const roll = (p: Pattern) => (
    <Display aspect="16 / 9">
      <div data-roll role="grid" aria-multiselectable="true" aria-label={`Piano roll, pattern ${p}`} onKeyDown={onRollKey}>
        {notes.map((note, r) => (
          <div key={note} role="row" data-roll-row data-sharp={note.includes("#") || undefined}>
            <span role="rowheader" data-roll-key>
              {note.startsWith("C") && !note.includes("#") ? note : ""}
            </span>
            {bank[p][r].map((on, c) => (
              <button
                key={c}
                type="button"
                role="gridcell"
                data-cell={`${r}:${c}`}
                tabIndex={active === `${r}:${c}` ? 0 : -1}
                onFocus={() => setActive(`${r}:${c}`)}
                aria-label={`${note}, step ${c + 1}`}
                aria-selected={on}
                data-beat={c % 4 === 0 || undefined}
                data-now={(p === pattern && c === step) || undefined}
                onClick={() => toggle(r, c)}
              />
            ))}
          </div>
        ))}
        {/* The step lane: an LED under each step, lit at the playhead, dim
            where the step has notes, with the beats marked. */}
        <div data-roll-steps aria-hidden>
          <span />
          {Array.from({ length: steps }, (_, c) => (
            <i
              key={c}
              data-beat={c % 4 === 0 || undefined}
              data-filled={bank[p].some((row) => row[c]) || undefined}
              data-now={(playing && p === pattern && c === step) || undefined}
            />
          ))}
        </div>
      </div>
    </Display>
  )

  return (
    <Device model="MX-1" name="MIDI" on={playing} plate="none">
      <div data-midi-bank>
        <Tabs
          label="Patterns"
          value={pattern}
          onValueChange={(value) => setPattern(value as Pattern)}
          items={patterns.map((p) => ({ value: p, label: p, body: roll(p) }))}
        />
      </div>
      <DevicePlate model="MX-1" name="MIDI" on={playing} under />

      <div data-midi-deck>
        <div data-midi-keys>
          <Button
            tone="primary"
            aria-label={playing ? "Stop" : "Play"}
            onClick={() => {
              audio.current ??= new AudioContext()
              void audio.current.resume()
              setPlaying(!playing)
              setStep(-1)
            }}
          >
            <Icon name={playing ? "stop" : "play"} />
          </Button>
          <Button aria-label="Random phrase" onClick={() => setGrid(() => invent())}>
            <Icon name="shuffle" />
          </Button>
          <Button aria-label="Clear" onClick={() => setGrid(() => empty())}>
            <Icon name="trash" />
          </Button>
        </div>
        <section data-section data-named aria-label="Wave" data-midi-wave>
          <SlideSwitch label="Wave" options={Object.keys(waves)} defaultValue="Tri" onValueChange={(value) => setWave(waves[value as Wave])} />
        </section>
        <div data-midi-knobs>
          <FlatKnob label="Tempo" color="white" value={tempo} onValueChange={setTempo} />
          <FlatKnob label="Cutoff" color="orange" value={cutoff} onValueChange={setCutoff} />
          <FlatKnob label="Swing" color="green" value={swing} onValueChange={setSwing} />
        </div>
      </div>
    </Device>
  )
}

export { MidiEditor }
