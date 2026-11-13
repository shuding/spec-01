import * as React from "react"
import { Checkbox } from "@/registry/hardware/ui/checkbox"
import { FlatKnob } from "@/registry/hardware/ui/flat-knob"
import { Icon } from "@/registry/hardware/ui/icon"
import { Slider } from "@/registry/hardware/ui/slider"
import { Display } from "@/registry/hardware/ui/display"
import { Lcd, LcdDigits } from "@/registry/hardware/ui/lcd"
import { Device, clock } from "@/registry/hardware/ui/device"
import { ButtonGroup } from "@/registry/hardware/ui/button-group"
import { ItemList } from "@/registry/hardware/ui/item-list"
import { chapters, filmLength, frame, ready } from "@/registry/hardware/blocks/music-player/film"

const strawberries = "/photos/strawberries.jpg"
const lioness = "/photos/lioness.jpg"
const walrus = "/photos/walrus.jpg"
const peaks = "/photos/peaks.jpg"
const highlands = "/photos/highlands.jpg"

type Item =
  | { kind: "audio"; title: string; artist: string; length: number; art: string }
  | { kind: "video"; title: string; artist: string; length: number }

const items: Item[] = [
  { kind: "audio", title: "Never Gonna Give You Up", artist: "Rick Astley", length: 213, art: highlands },
  { kind: "audio", title: "Low Orbit", artist: "Halcyon Unit", length: 214, art: strawberries },
  { kind: "video", title: "Field Notes", artist: "Short film", length: filmLength },
  { kind: "audio", title: "Patch Bay", artist: "Moiré", length: 187, art: lioness },
  { kind: "audio", title: "Tape Stop", artist: "Kit & Cable", length: 242, art: walrus },
  { kind: "audio", title: "Detent", artist: "Oscillo", length: 231, art: peaks },
]

// The film, drawn for the current time whenever it changes.
function Film({ time }: { time: number }) {
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = React.useState(false)
  React.useEffect(() => {
    let live = true
    void ready.then(() => live && setLoaded(true))
    return () => {
      live = false
    }
  }, [])
  React.useEffect(() => {
    const el = canvas.current!
    const ratio = devicePixelRatio || 1
    if (el.width !== el.clientWidth * ratio) {
      el.width = el.clientWidth * ratio
      el.height = el.clientHeight * ratio
    }
    const ctx = el.getContext("2d")!
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    frame(ctx, el.clientWidth, el.clientHeight, time)
  }, [time, loaded])
  const chapter = [...chapters].reverse().find((c) => time >= c.start)!
  return <canvas ref={canvas} role="img" aria-label={`Film, ${chapter.title}`} />
}

// A pocket player: the screen on the left, its controls on the right, the
// scrub fader under both, and the queue below as an item list whose playing
// row fills as it plays.
function MusicPlayer() {
  const [index, setIndex] = React.useState(0)
  const [time, setTime] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const item = items[index]

  React.useEffect(() => {
    if (!playing) return
    let last = performance.now()
    let id = requestAnimationFrame(function tick(now) {
      setTime((t) => t + (now - last) / 1000)
      last = now
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [playing])

  React.useEffect(() => {
    if (time < item.length) return
    setIndex((i) => (i + 1) % items.length)
    setTime(0)
  }, [time, item.length])

  const go = (step: number) => {
    setIndex((i) => (i + step + items.length) % items.length)
    setTime(0)
  }

  return (
    <Device model="MP-1" name="Player" on={playing}>
      <div data-player>
        <div data-player-screen>
          <Display aspect="1 / 1">
            {item.kind === "video" ? (
              <Film time={time} />
            ) : (
              <div data-art style={{ background: `center / cover no-repeat url(${item.art})` }}>
                <div data-spectrum data-playing={playing || undefined} aria-hidden>
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </div>
              </div>
            )}
          </Display>
        </div>

        <Lcd tag={`${String(index + 1).padStart(2, "0")} · ${item.kind === "video" ? "Video" : "Audio"}`} data-player-now>
          <strong>{item.title}</strong>
          <LcdDigits value={clock(time)} ghost="8:88" />
        </Lcd>

        <div data-player-cell data-wide>
          <ButtonGroup
            label="Transport"
            tone="primary"
            parts={[
              { label: "Previous", content: <Icon name="skip-back" />, onPress: () => go(-1) },
              { label: playing ? "Pause" : "Play", content: <Icon name={playing ? "pause" : "play"} />, onPress: () => setPlaying(!playing) },
              { label: "Next", content: <Icon name="skip-forward" />, onPress: () => go(1) },
            ]}
          />
        </div>

        <div data-player-cell>
          <Checkbox label="Shuffle" icon="shuffle" />
          <small aria-hidden>Shuf</small>
        </div>
        <div data-player-cell>
          <Checkbox label="Repeat" icon="repeat" defaultChecked />
          <small aria-hidden>Rpt</small>
        </div>
        <div data-player-cell>
          <FlatKnob label="Volume" color="white" defaultValue={70} />
          <small aria-hidden>Vol</small>
        </div>

        <div data-player-scrub>
          <Slider label="Position" value={time} min={0} max={item.length} step={0.5} onValueChange={setTime} />
        </div>
      </div>

      <ItemList
        label="Queue"
        rows={items}
        rowKey={(entry) => entry.title}
        value={item.title}
        progress={time / item.length}
        onValueChange={(title) => {
          setIndex(items.findIndex((entry) => entry.title === title))
          setTime(0)
          setPlaying(true)
        }}
        columns={[
          { key: "n", label: "No", width: "22px", render: (entry) => String(items.indexOf(entry) + 1).padStart(2, "0") },
          { key: "title", label: "Title", width: "minmax(0, 1fr)", render: (entry) => entry.title },
          { key: "len", label: "Time", width: "38px", align: "end", render: (entry) => clock(entry.length) },
        ]}
      />
    </Device>
  )
}

export { MusicPlayer }
