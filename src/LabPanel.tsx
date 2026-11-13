import * as React from "react"
import { Radio, RadioGroup } from "@ui-sdk/react/radio"

// The key colors, as OKLCH lightness, chroma and hue, in order round the hue
// wheel with black last. Orange-red is the default. Black has no chroma, and
// lights its LEDs white instead of in the key color. Yellow is light enough
// that text on it turns to ink, and too light to print on the panels as it
// is, so the skin darkens it there (--key-ink).
const keys = [
  { id: "orange", name: "Orange-red", l: 0.64, c: 0.31, h: 48 },
  { id: "yellow", name: "Yellow", l: 0.94, c: 0.23, h: 105.21 },
  { id: "green", name: "Green", l: 0.7, c: 0.29, h: 147.6 },
  { id: "blue", name: "Blue", l: 0.56, c: 0.37, h: 260 },
  { id: "violet", name: "Violet", l: 0.56, c: 0.3, h: 296.49 },
  { id: "black", name: "Black", l: 0.24, c: 0, h: 0 },
] as const

const defaultKey = keys.find((key) => key.id === "orange")!

type Key = (typeof keys)[number]

// The theme is three custom properties and a data-key attribute on the
// site's root. Switching keys writes them straight onto that element rather
// than through React state at the top of the tree: re-rendering every page
// and panel for a color change made switching slow, worst in Safari.
const themeStyle = (key: Key) =>
  ({ "--theme-l": key.l, "--theme-c": key.c, "--theme-h": key.h }) as React.CSSProperties

// The favicon is a big circle in the key color. Its fill is written twice:
// the exact OKLCH color, and before it the browser's own sRGB rendering of
// it, for anything that draws the icon without OKLCH.
function setFavicon(key: Key) {
  const color = `oklch(${key.l} ${key.c} ${key.h})`
  let hex = "#1c1c1c"
  const ctx = document.createElement("canvas").getContext("2d")
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" style="fill:${hex};fill:${color}"/></svg>`
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    document.head.append(link)
  }
  link.type = "image/svg+xml"
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function applyKey(root: HTMLElement, key: Key) {
  setFavicon(key)
  root.dataset.key = key.id
  root.style.setProperty("--theme-l", String(key.l))
  root.style.setProperty("--theme-c", String(key.c))
  root.style.setProperty("--theme-h", String(key.h))
}

// The key color picker, at the right end of the navbar: small keys in the
// key colors, the chosen one ringed. It keeps the choice to itself and
// applies it to the site's root, the nearest [data-skin] around it.
function KeyPicker() {
  const [chosen, setChosen] = React.useState<Key>(defaultKey)
  const picker = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => setFavicon(defaultKey), [])
  return (
    <RadioGroup
      ref={picker}
      data-kit="key-picker"
      aria-label="Key color"
      value={chosen.id}
      onValueChange={(id) => {
        const next = keys.find((option) => option.id === id)
        if (!next) return
        setChosen(next)
        const root = picker.current?.closest<HTMLElement>("[data-skin]")
        if (root) applyKey(root, next)
      }}
    >
      {keys.map((option) => (
        <Radio
          key={option.id}
          value={option.id}
          data-kit="key-swatch"
          aria-label={option.name}
          title={option.name}
          style={{ "--swatch": `oklch(${option.l} ${option.c} ${option.h})` } as React.CSSProperties}
        />
      ))}
    </RadioGroup>
  )
}

export { KeyPicker, defaultKey, themeStyle }
