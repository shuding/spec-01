import * as React from "react"
import { Button } from "@/registry/hardware/ui/button"
import { Checkbox } from "@/registry/hardware/ui/checkbox"
import { Icon } from "@/registry/hardware/ui/icon"
import { FlatKnob } from "@/registry/hardware/ui/flat-knob"
import { Display } from "@/registry/hardware/ui/display"
import { SlideSwitch } from "@/registry/hardware/ui/slide-switch"
import { Device } from "@/registry/hardware/ui/device"

const photo = "/photos/fjord.jpg"

const presets: Record<string, string> = {
  None: "",
  Mono: "grayscale(1) contrast(1.1)",
  Warm: "sepia(0.35) saturate(1.2) hue-rotate(-8deg)",
  Cool: "saturate(0.9) hue-rotate(14deg) brightness(1.03)",
  Fade: "contrast(0.82) brightness(1.08) saturate(0.75)",
}
const aspects: Record<string, number | null> = { Free: null, "1:1": 1, "4:3": 4 / 3, "3:2": 3 / 2, "16:9": 16 / 9 }

type Box = { x: number; y: number; w: number; h: number }
type Corner = "nw" | "ne" | "sw" | "se"
const corners: Corner[] = ["nw", "ne", "sw", "se"]

// A photo editor behind glass. Filters are CSS filters on the image while
// editing, and the same string on a canvas when saving, so what you see is
// what you get. The crop frame moves by dragging and resizes by its corner
// caps, keeping the chosen aspect, or any shape under Free.
function ImageEditor() {
  const screen = React.useRef<HTMLDivElement>(null)
  const [preset, setPreset] = React.useState("None")
  const [exposure, setExposure] = React.useState(50)
  const [contrast, setContrast] = React.useState(50)
  const [saturation, setSaturation] = React.useState(50)
  const [warmth, setWarmth] = React.useState(50)
  const [turns, setTurns] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [cropping, setCropping] = React.useState(false)
  const [aspect, setAspect] = React.useState("4:3")
  const [crop, setCrop] = React.useState<Box>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })

  const scale = (v: number, span: number) => 1 + ((v - 50) / 50) * span
  const filter = [
    presets[preset],
    `brightness(${scale(exposure, 0.5)})`,
    `contrast(${scale(contrast, 0.5)})`,
    `saturate(${scale(saturation, 1)})`,
    warmth >= 50 ? `sepia(${((warmth - 50) / 50) * 0.5})` : `hue-rotate(${((50 - warmth) / 50) * 25}deg)`,
  ]
    .filter(Boolean)
    .join(" ")
  const quarter = turns % 2 === 1
  const transform = `rotate(${turns * 90}deg) scale(${quarter ? 4 / 3 : 1}) scaleX(${flipped ? -1 : 1})`

  // The crop frame: the largest box of the chosen aspect that fits, at 80%.
  React.useEffect(() => {
    const ratio = aspects[aspect]
    const box = screen.current!.getBoundingClientRect()
    if (!ratio) return setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
    let w = 0.8
    let h = (w * box.width) / ratio / box.height
    if (h > 0.8) {
      h = 0.8
      w = (h * box.height * ratio) / box.width
    }
    setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h })
  }, [aspect])

  // A drag on the frame moves it; a drag on a corner cap resizes it from the
  // opposite corner, freely under Free, holding the ratio otherwise.
  const drag = React.useRef<{ x: number; y: number; from: Box; corner: Corner | null } | null>(null)

  const resize = (d: { x: number; y: number; from: Box; corner: Corner }, clientX: number, clientY: number) => {
    const box = screen.current!.getBoundingClientRect()
    const { from, corner } = d
    const min = 0.12
    const west = corner.includes("w")
    const north = corner.includes("n")
    // The anchored corner, opposite the one held.
    const ax = west ? from.x + from.w : from.x
    const ay = north ? from.y + from.h : from.y
    let w = Math.max(min, from.w + ((clientX - d.x) / box.width) * (west ? -1 : 1))
    let h = Math.max(min, from.h + ((clientY - d.y) / box.height) * (north ? -1 : 1))
    w = Math.min(w, west ? ax : 1 - ax)
    h = Math.min(h, north ? ay : 1 - ay)
    const ratio = aspects[aspect]
    if (ratio) {
      // Hold the ratio: follow the width, and give way if the height runs
      // out of photo.
      h = (w * box.width) / ratio / box.height
      const room = north ? ay : 1 - ay
      if (h > room) {
        h = room
        w = (h * box.height * ratio) / box.width
      }
    }
    setCrop({ x: west ? ax - w : ax, y: north ? ay - h : ay, w, h })
  }

  const save = async () => {
    const box = screen.current!.getBoundingClientRect()
    const image = new Image()
    image.src = photo
    await image.decode()
    const ratio = 2
    const area = cropping ? crop : { x: 0, y: 0, w: 1, h: 1 }
    const canvas = document.createElement("canvas")
    canvas.width = area.w * box.width * ratio
    canvas.height = area.h * box.height * ratio
    const ctx = canvas.getContext("2d")!
    ctx.scale(ratio, ratio)
    ctx.translate(-area.x * box.width, -area.y * box.height)
    ctx.translate(box.width / 2, box.height / 2)
    ctx.rotate((turns * Math.PI) / 2)
    const s = quarter ? 4 / 3 : 1
    ctx.scale(s * (flipped ? -1 : 1), s)
    ctx.filter = filter || "none"
    const cover = Math.max(box.width / image.width, box.height / image.height)
    ctx.drawImage(image, (-image.width * cover) / 2, (-image.height * cover) / 2, image.width * cover, image.height * cover)
    const link = document.createElement("a")
    link.download = "photo.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <Device model="IX-1" name="Photo" on>
      <Display aspect="4 / 3" label={cropping ? `Crop ${aspect}` : preset === "None" ? "Original" : preset}>
        <div ref={screen} data-editor-screen>
          <img src={photo} alt="A fjord seen from a high granite cliff" style={{ filter, transform }} draggable={false} />
          {cropping && (
            <div
              data-crop
              role="group"
              aria-label="Crop frame, drag to move, drag a corner to resize"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                const corner = ((event.target as HTMLElement).dataset.cropCap as Corner | undefined) ?? null
                drag.current = { x: event.clientX, y: event.clientY, from: crop, corner }
              }}
              onPointerMove={(event) => {
                const d = drag.current
                if (!d) return
                if (d.corner) return resize({ ...d, corner: d.corner }, event.clientX, event.clientY)
                const box = screen.current!.getBoundingClientRect()
                setCrop({
                  ...d.from,
                  x: Math.min(1 - d.from.w, Math.max(0, d.from.x + (event.clientX - d.x) / box.width)),
                  y: Math.min(1 - d.from.h, Math.max(0, d.from.y + (event.clientY - d.y) / box.height)),
                })
              }}
              onPointerUp={() => {
                drag.current = null
              }}
            >
              {corners.map((corner) => (
                <i key={corner} data-crop-cap={corner} />
              ))}
            </div>
          )}
        </div>
      </Display>

      <div data-row data-editor-knobs>
        <FlatKnob label="Exp" color="white" defaultValue={50} onValueChange={setExposure} />
        <FlatKnob label="Con" color="white" defaultValue={50} onValueChange={setContrast} />
        <FlatKnob label="Sat" color="white" defaultValue={50} onValueChange={setSaturation} />
        <FlatKnob label="Warm" color="white" defaultValue={50} onValueChange={setWarmth} />
      </div>

      <div data-editor-deck>
        <div data-editor-switches>
          <section data-section data-named aria-label="Look">
            <SlideSwitch label="Look" side="start" options={Object.keys(presets)} defaultValue="None" onValueChange={setPreset} />
          </section>
          <section data-section data-named aria-label="Aspect">
            <SlideSwitch label="Aspect" options={Object.keys(aspects)} defaultValue="4:3" onValueChange={setAspect} />
          </section>
        </div>
        <div data-editor-keys>
          <Button aria-label="Rotate" onClick={() => setTurns((t) => (t + 1) % 4)}>
            <Icon name="rotate" />
          </Button>
          <Button aria-label="Flip" onClick={() => setFlipped(!flipped)}>
            <Icon name="flip" />
          </Button>
          <Checkbox label="Crop" onCheckedChange={setCropping} />
          <Button tone="primary" aria-label="Save" onClick={save}>
            <Icon name="save" />
          </Button>
        </div>
      </div>
    </Device>
  )
}

export { ImageEditor }
