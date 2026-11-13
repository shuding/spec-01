import * as React from "react"
import { CatalogGrid } from "./catalog/Catalog"
import { Navbar } from "@/registry/hardware/ui/navbar"
import { Toasts, notify } from "@/registry/hardware/ui/toaster"
import { Icon } from "@/registry/hardware/ui/icon"
import { Button } from "@/registry/hardware/ui/button"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"
import { haptic } from "@/registry/hardware/lib/haptics"
import { onSoundChange, setSoundEnabled, soundEnabled } from "@/registry/hardware/lib/sound"
import { KeyPicker, defaultKey, themeStyle } from "./LabPanel"
import { Dashboard } from "@/registry/hardware/blocks/dashboard/dashboard"
import { MusicPlayer } from "@/registry/hardware/blocks/music-player/music-player"
import { Paint } from "@/registry/hardware/blocks/paint/paint"
import { ImageEditor } from "@/registry/hardware/blocks/image-editor/image-editor"
import { MidiEditor } from "@/registry/hardware/blocks/midi-editor/midi-editor"
import { Timer } from "@/registry/hardware/blocks/timer/timer"
import { ColorInstrument } from "@/registry/hardware/blocks/color/color"

const pages = [
  { route: "", title: "Components", line: "Every part of the kit, on one panel." },
  {
    route: "music",
    title: "Player",
    line: "A compact player: screen on the left, controls on the right, the queue below.",
  },
  { route: "paint", title: "Paint", line: "A drawing pad behind glass, with tool keys and a brush knob." },
  { route: "midi", title: "MIDI", line: "A piano roll on a screen, played through a small synth." },
  { route: "timer", title: "Timer", line: "A kitchen timer: drag the dial, watch the wedge shrink." },
  {
    route: "color",
    title: "Color",
    line: "A pocket color instrument: three encoders, a hue ring and eight slots.",
  },
  { route: "image", title: "Photo", line: "Looks, knobs, crop, rotate and flip, saved as a PNG." },
  {
    route: "dashboard",
    title: "Dashboard",
    line: "A service console as a handheld: D-pad, screen, A and B.",
  },
]

function Page({ route }: { route: string }) {
  if (route === "music") return <MusicPlayer />
  if (route === "paint") return <Paint />
  if (route === "midi") return <MidiEditor />
  if (route === "timer") return <Timer />
  if (route === "color") return <ColorInstrument />
  if (route === "image") return <ImageEditor />
  if (route === "dashboard" || route === "deployments") return <Dashboard />
  return (
    <>
      <header data-kit="masthead">
        <h1>SPEC-01/Hardware</h1>
        <p>
          A hardware theme for{" "}
          <a href="https://ui-sdk.dev" target="_blank">
            Vercel UI SDK
          </a>
          , a library of behaviors to build your own components. Every control here is a Vercel UI SDK component
          underneath.
        </p>
        <InstallPrompt />
      </header>
      <CatalogGrid />
    </>
  )
}

// What to tell a coding agent to install the kit: the registry, and the root
// everything sits in.
const agentPrompt = `Install components from the SPEC-01 shadcn registry,
https://spec-01.vercel.app/r/registry.json
Wrap the app in <Hardware> from components/ui/hardware.`

// The prompt opens in a popover from the link, printed on its LCD with a
// cursor waiting after it, and a key that copies it.
function InstallPrompt() {
  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    notify("Copied", { description: "Paste it into your coding agent." })
    haptic("success")
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
    navigator.clipboard.writeText(agentPrompt).catch(() => {
      setCopied(false)
      haptic("error")
      notify("Couldn't copy", { description: "The clipboard wasn't available." })
    })
  }
  return (
    <div data-install-prompt>
      <Popover>
        <PopoverTrigger data-kit="link">Installation prompt</PopoverTrigger>
        <PopoverContent data-kit="popover" side="bottom" align="start" sideOffset={12} aria-label="Installation prompt">
          <div data-kit="popover-surface" data-install-prompt-surface>
            <p data-install-prompt-text>
              {agentPrompt}
              <span data-install-caret aria-hidden />
            </p>
            <div data-kit="actions">
              <PopoverClose data-kit="button" data-tone="secondary">
                Close
              </PopoverClose>
              <Button tone="primary" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// The site's root carries the theme. It renders the default once; the key
// picker changes it on the element directly, so a color switch doesn't
// re-render the pages.
function Frame({ route }: { route: string }) {
  const current = pages.find((page) => page.route === route) ?? pages[0]
  // The navbar is fixed over the page, so the page is padded by its height,
  // which changes with the width (it takes two rows on a phone).
  const site = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const root = site.current!
    const bar = root.querySelector<HTMLElement>(':scope > [data-kit="navbar"]')
    if (!bar) return
    const measure = () => root.style.setProperty("--nav-h", `${bar.offsetHeight}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={site} data-skin="hardware" data-key={defaultKey.id} data-site style={themeStyle(defaultKey)}>
      <Navbar
        leading={
          <>
            <KeyPicker />
            <SoundToggle />
          </>
        }
        items={pages.map((page) => ({
          href: `/${page.route}`,
          label: page.title,
          current: page === current,
        }))}
      />
      <main data-site-page={current.route || "components"} data-kit="sheet">
        <Page route={current.route} />
      </main>
      <footer data-site-footer>
        by{" "}
        <a href="https://x.com/shuding" target="_blank">
          @shuding
        </a>
      </footer>
      <Toasts />
    </div>
  )
}

// The mute key beside the color picker: interaction sounds on or off,
// remembered across visits. Turning sound on ticks, so you hear it's back.
function SoundToggle() {
  const [on, setOn] = React.useState(soundEnabled)
  React.useEffect(() => onSoundChange(setOn), [])
  return (
    <button
      type="button"
      data-kit="sound-toggle"
      aria-pressed={on}
      aria-label="Interaction sounds"
      title={on ? "Sounds on" : "Sounds off"}
      onClick={() => {
        setSoundEnabled(!on)
        if (!on) haptic("selection")
      }}
    >
      <Icon name={on ? "volume" : "volume-mute"} />
    </button>
  )
}

function Site({ route }: { route: string }) {
  return <Frame route={route} />
}

export { Site, pages }
