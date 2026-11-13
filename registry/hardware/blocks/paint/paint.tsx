import * as React from "react"
import { Button } from "@/registry/hardware/ui/button"
import { Icon } from "@/registry/hardware/ui/icon"
import { FlatKnob } from "@/registry/hardware/ui/flat-knob"
import { ModeDial } from "@/registry/hardware/ui/mode-dial"
import { AlertDialog } from "@/registry/hardware/ui/alert-dialog"
import { Display } from "@/registry/hardware/ui/display"
import { Device, DevicePlate } from "@/registry/hardware/ui/device"

// The drawing is black and white: white ink on the black screen.
const ink = "#f4f4f0"

type Tool = "Pen" | "Brush" | "Marker" | "Erase"

// A drawing pad behind glass. The canvas keeps its pixels at the screen's
// density; each stroke is saved for undo once the pen lifts.
//
// A stroke is drawn opaque on a layer of its own, then laid over a snapshot
// of the canvas at the tool's opacity. Drawn straight onto the canvas, each
// pointer move would be its own translucent segment, and where segments
// overlap their opacity would stack into stripes.
function Paint() {
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const layer = React.useRef<HTMLCanvasElement | null>(null)
  const before = React.useRef<ImageData | null>(null)
  const history = React.useRef<ImageData[]>([])
  const [tool, setTool] = React.useState<Tool>("Pen")
  const [size, setSize] = React.useState(30)
  const [flow, setFlow] = React.useState(90)
  const [steps, setSteps] = React.useState(0)

  const context = () => canvas.current!.getContext("2d")!
  const pen = () => layer.current!.getContext("2d")!

  React.useEffect(() => {
    const el = canvas.current!
    const ratio = devicePixelRatio || 1
    el.width = el.clientWidth * ratio
    el.height = el.clientHeight * ratio
    context().scale(ratio, ratio)
    const off = document.createElement("canvas")
    off.width = el.width
    off.height = el.height
    layer.current = off
    const ctx = pen()
    ctx.scale(ratio, ratio)
    ctx.lineJoin = "round"
  }, [])

  const remember = () => {
    const el = canvas.current!
    history.current = [...history.current.slice(-29), context().getImageData(0, 0, el.width, el.height)]
    setSteps(history.current.length)
  }

  const undo = () => {
    const el = canvas.current!
    history.current.pop()
    const last = history.current.at(-1)
    if (last) context().putImageData(last, 0, 0)
    else context().clearRect(0, 0, el.width, el.height)
    setSteps(history.current.length)
  }

  const clear = () => {
    const el = canvas.current!
    context().clearRect(0, 0, el.width, el.height)
    remember()
  }

  // The drawing is white on a black screen, so it's saved on black too.
  const save = () => {
    const el = canvas.current!
    const flat = document.createElement("canvas")
    flat.width = el.width
    flat.height = el.height
    const ctx = flat.getContext("2d")!
    ctx.fillStyle = "#0b0b0a"
    ctx.fillRect(0, 0, flat.width, flat.height)
    ctx.drawImage(el, 0, 0)
    const link = document.createElement("a")
    link.download = "sketch.png"
    link.href = flat.toDataURL("image/png")
    link.click()
  }

  const stroke = React.useRef<{ x: number; y: number } | null>(null)
  // Where the pointer is on the canvas, in its own CSS pixels. On a zoomed
  // device (a phone) the canvas shows smaller than it's laid out, so the
  // on-screen offset is scaled back by the zoom.
  const point = (event: React.PointerEvent) => {
    const el = canvas.current!
    const box = el.getBoundingClientRect()
    const scale = box.width ? el.clientWidth / box.width : 1
    return { x: (event.clientX - box.left) * scale, y: (event.clientY - box.top) * scale, pressure: event.pressure || 0.5 }
  }

  // The pen for the stroke's layer: always opaque ink. The tool's opacity and
  // erasing are applied when the layer is laid on the canvas.
  const style = (ctx: CanvasRenderingContext2D, pressure: number) => {
    const width = 1 + (size / 100) * 40
    ctx.strokeStyle = ink
    ctx.shadowColor = ink
    ctx.shadowBlur = tool === "Brush" ? width * 0.6 : 0
    // Round for every tool: a square cap on each segment would notch the
    // stroke at every turn.
    ctx.lineCap = "round"
    ctx.lineWidth = tool === "Pen" ? Math.max(1, width * 0.35 * (0.5 + pressure)) : tool === "Erase" ? width * 1.5 : width
  }

  // The canvas as it was before the stroke, with the stroke so far laid on
  // it once, at the tool's opacity.
  const lay = () => {
    const ctx = context()
    ctx.putImageData(before.current!, 0, 0)
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    // The eraser always clears fully; flow is how much ink the others lay.
    ctx.globalAlpha = tool === "Erase" ? 1 : tool === "Marker" ? 0.45 * (flow / 100) : flow / 100
    ctx.globalCompositeOperation = tool === "Erase" ? "destination-out" : "source-over"
    ctx.drawImage(layer.current!, 0, 0)
    ctx.restore()
  }

  return (
    <Device model="PX-1" name="Paint" plate="none">
      <Display aspect="4 / 3">
        <canvas
          ref={canvas}
          data-paint-canvas
          data-tool={tool}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            const p = point(event)
            stroke.current = p
            const el = canvas.current!
            before.current = context().getImageData(0, 0, el.width, el.height)
            const ctx = pen()
            ctx.save()
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, el.width, el.height)
            ctx.restore()
            style(ctx, p.pressure)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x + 0.01, p.y)
            ctx.stroke()
            lay()
          }}
          onPointerMove={(event) => {
            const last = stroke.current
            if (!last) return
            const p = point(event)
            const ctx = pen()
            style(ctx, p.pressure)
            ctx.beginPath()
            ctx.moveTo(last.x, last.y)
            ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2)
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
            lay()
            stroke.current = p
          }}
          onPointerUp={() => {
            if (!stroke.current) return
            stroke.current = null
            remember()
          }}
        />
      </Display>
      <DevicePlate model="PX-1" name="Paint" under />

      <div data-paint-deck>
        <section data-section data-named aria-label="Tool">
          <ModeDial
            label="Tool"
            sweep={150}
            options={["Pen", "Brush", "Marker", "Erase"].map((t) => ({ value: t, label: t }))}
            defaultValue="Pen"
            onValueChange={(value) => setTool(value as Tool)}
          />
        </section>
        <div data-paint-controls>
          <FlatKnob label="Size" color="white" defaultValue={size} onValueChange={setSize} />
          <FlatKnob label="Flow" color="white" defaultValue={flow} onValueChange={setFlow} />
          <div data-row>
            <Button onClick={undo} disabled={steps === 0} aria-label="Undo">
              <Icon name="undo" />
            </Button>
            <AlertDialog
              trigger={<Icon name="trash" />}
              label="Clear canvas"
              title="Clear the canvas?"
              description="Every stroke is removed. Undo brings it back."
              confirm="Clear"
              onConfirm={clear}
            />
            <Button tone="primary" onClick={save} aria-label="Save">
              <Icon name="save" />
            </Button>
          </div>
        </div>
      </div>
    </Device>
  )
}

export { Paint }
