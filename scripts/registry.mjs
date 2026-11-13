#!/usr/bin/env node
// Builds the shadcn/ui registry: writes registry.json from the files under
// registry/hardware, then runs `shadcn build`, which writes public/r/*.json
// for the site to serve.
//
//   pnpm registry:build                      # also runs as part of `pnpm build`
//   REGISTRY_URL=https://example.com pnpm registry:build
//
// Items:
// - hardware: a registry:item that sets the project up for the kit: the
//   <Hardware> root, the skin's stylesheets, the page-wide behaviors
//   (haptics, sounds, focus modality, block caret, Safari tabbing), and the
//   font, imported into the project's CSS file. Every other item depends on it.
// - one item per component in registry/hardware/ui
// - <component>-demo: one usage example per component, as the catalog shows it
// - one block per device in registry/hardware/blocks
//
// Dependencies are read from each file's imports: npm packages (pinned to the
// versions this site uses) and other registry items (from @/registry imports).
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const root = new URL("..", import.meta.url).pathname
const base = (process.env.REGISTRY_URL || "https://spec-01.vercel.app").replace(/\/$/, "")
const reg = "registry/hardware"
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const read = (path) => readFileSync(join(root, path), "utf8")
const list = (dir, test = () => true) => readdirSync(join(root, dir)).filter(test).sort()
const itemUrl = (name) => `${base}/r/${name}.json`
const author = "Shu Ding <https://x.com/shuding>"

const components = {
  accordion: ["Accordion", "Stacked sections that open one at a time, each behind a key with a turning chevron."],
  alert: ["Alert", "A printed notice with a status lamp: info, success, warning or danger."],
  "alert-dialog": ["Alert dialog", "A confirmation that has to be answered, for destructive actions."],
  avatar: ["Avatar", "Initials printed on a dot-matrix disc."],
  badge: ["Badge", "A small status label in one of five tones."],
  "bar-graph": ["Bar graph", "A segmented LED level meter across several channels."],
  breadcrumb: ["Breadcrumb", "A path of pages, printed like a menu trail on a screen."],
  button: ["Button", "A key standing in its hole: primary, secondary or round, with haptics and a press sound."],
  "button-group": ["Button group", "Keys joined in one rocker, horizontal or vertical, with hold-to-repeat."],
  card: ["Card", "A raised panel with a heading, for grouping content."],
  carousel: ["Carousel", "Slides on a screen, stepped by keys and indicator dots."],
  checkbox: ["Checkbox", "A latching key that stays down while checked, with an indicator lamp."],
  "code-block": ["Code block", "Highlighted code on a screen, with a copy key."],
  collapsible: ["Collapsible", "One section behind a key that shows and hides it."],
  combobox: ["Combobox", "A text field that filters a list of options as you type."],
  "command-palette": ["Command palette", "A searchable list of commands in a dialog."],
  "context-menu": ["Context menu", "An area that opens a menu on right-click, or a long press on touch."],
  "data-table": ["Data table", "Rows with selection, status badges and a menu per row."],
  "date-picker": ["Date picker", "A date field with a calendar that opens beside it."],
  "date-setter": ["Calendar", "A month calendar set with keys, like a watch's date."],
  device: ["Device", "A molded device body with a maker's plate and power LED, scaled to fit narrow pages."],
  dialog: ["Dialog", "A modal panel with a title, description and confirm and cancel keys."],
  display: ["Display", "A screen in a thick black bezel, for images or any content."],
  dpad: ["D-pad", "A four-way directional pad that tilts toward the pressed side."],
  drawer: ["Drawer", "A panel that slides in from the edge of the page."],
  feed: ["Feed", "A list of activity: who did what, and when."],
  fieldset: ["Fieldset", "A labeled group of controls."],
  "flat-knob": ["Flat knob", "A knob turned by dragging, with a lit tick scale and a typed readout."],
  "hover-card": ["Hover card", "A card on a gray LCD that opens on hover, focus or tap."],
  icon: ["Icon", "The kit's icons, drawn from Carbon."],
  "item-list": ["Item list", "Rows in columns on a screen, with one chosen row."],
  lcd: ["LCD", "A segmented liquid-crystal readout, with seven-segment digits."],
  menu: ["Menu", "A round key that opens a menu of actions."],
  menubar: ["Menubar", "A row of menus, with checkable items."],
  meter: ["Meter", "A labeled level in a track, like a gauge."],
  "mode-dial": ["Mode dial", "A rotary selector with printed stops, turned by dragging or keys."],
  navbar: ["Navbar", "A navigation bar on acrylic, with a lamp beside each page."],
  "otp-input": ["OTP input", "One-time-code slots, typed one character each."],
  "page-wheel": ["Page wheel", "Pagination as a thumb wheel with previous and next keys."],
  pagination: ["Pagination", "Page keys with previous, next and ellipses."],
  popover: ["Popover", "A panel that opens from a key, with a title and description."],
  progress: ["Progress", "A labeled progress bar."],
  "radio-group": ["Radio group", "Options where one is chosen, each with an indicator."],
  resizable: ["Resizable", "Panels split by a handle that drags or steps with keys."],
  "scroll-area": ["Scroll area", "A scrolling region with its own scrollbar."],
  "segmented-control": ["Segmented control", "A row of segments with a sliding indicator, dragged or clicked."],
  select: ["Select", "A thumb wheel of options, scrolled or dragged to choose."],
  separator: ["Separator", "A printed rule between groups."],
  "side-tabs": ["Side tabs", "Tabs down the side of a panel, like index tabs."],
  skeleton: ["Skeleton", "Placeholder lines for content that's loading."],
  "slide-switch": ["Slide switch", "A lever that slides between printed positions, horizontal or vertical."],
  slider: ["Slider", "A fader with a lit track and a value readout."],
  stepper: ["Number stepper", "A number on a small screen with minus and plus keys."],
  switch: ["Switch", "A toggle with a sliding thumb, dragged or clicked."],
  tabs: ["Tabs", "Tabs over panels, with a sliding indicator."],
  "text-field": ["Text field", "A labeled text input with a block caret."],
  textarea: ["Textarea", "A labeled multi-line text input."],
  toast: ["Toast", "A key that shows a toast message, with its own toast region."],
  toaster: ["Toaster", "The page's toast region and a notify() helper."],
  "toggle-group": ["Toggle group", "Keys that latch together, one or several at a time."],
  toolbar: ["Toolbar", "A row of keys and toggles, moved through with arrow keys."],
  tooltip: ["Tooltip", "A label that appears on hover or focus, or a tap on touch."],
}

const blocks = {
  color: ["CX-1 Color", "A color instrument: a hue and lightness dial, harmony swatches, copy and random keys."],
  dashboard: ["DX-1 Dashboard", "A deployment console: an item list on a screen, a bar graph, a D-pad and deploy keys."],
  "image-editor": ["IX-1 Photo", "A photo editor: aspect and look switches, crop, and an image on a display."],
  "midi-editor": ["MX-1 MIDI", "A step sequencer: a piano roll with spatial keyboard navigation, patterns and tempo."],
  "music-player": ["MP-1 Player", "A music player: transport keys, an LCD, a scrubbing fader and a playlist."],
  paint: ["PX-1 Paint", "A drawing pad behind glass, with tool and ink keys, brush dials, undo, clear and save."],
  timer: ["TM-1 Timer", "A countdown timer on an LCD, with a mode switch and start and reset keys."],
}

// npm packages and registry items a set of files imports.
function dependenciesOf(files, self) {
  const npm = new Set()
  const items = new Set()
  for (const file of files) {
    const text = read(file)
    for (const [, spec] of text.matchAll(/^import\s[^"]*?"([^"]+)"/gm)) {
      if (spec.startsWith("@/registry/hardware/")) {
        const rest = spec.slice("@/registry/hardware/".length)
        const name =
          rest.startsWith("lib/") || rest.startsWith("ui/hardware") ? "hardware"
          : rest.startsWith("ui/") ? rest.slice(3)
          : rest.startsWith("blocks/") ? rest.split("/")[1]
          : null
        if (!name) throw new Error(`${file}: unexpected import ${spec}`)
        if (name !== self) items.add(name)
      } else if (!spec.startsWith(".") && !spec.startsWith("@/")) {
        const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
        if (name === "react" || name === "react-dom") continue
        const version = pkg.dependencies[name]
        if (!version) throw new Error(`${file}: ${name} isn't a dependency in package.json`)
        npm.add(`${name}@${version}`)
      }
    }
  }
  return { npm: [...npm].sort(), items: [...items].sort() }
}

// The kit's type: IBM Plex Mono, the weights the skin uses, loaded before
// anything is drawn (as the site's own font is), not swapped in.
const fontImport = '@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@200;300;400;500&display=block")'

function item(name, type, title, description, files, extra = {}) {
  const { npm, items } = dependenciesOf(files.map((f) => f.path), name)
  const deps = [...new Set([...(extra.after ?? []), ...items])].filter((n) => n !== name)
  return {
    name,
    type,
    title,
    description,
    author,
    ...(npm.length && { dependencies: npm }),
    ...(deps.length && { registryDependencies: deps.map(itemUrl) }),
    files,
    ...(extra.css && { css: extra.css }),
    ...(extra.docs && { docs: extra.docs }),
    ...(extra.categories && { categories: extra.categories }),
  }
}

const target = (path) => {
  const rest = relative(reg, path)
  if (rest.startsWith("ui/")) return `@ui/${rest.slice(3)}`
  if (rest.startsWith("lib/")) return `@lib/${rest.slice(4)}`
  return `@components/${rest}`
}
const file = (path, type) => ({ path, type, target: target(path) })

const items = []

// The root: the skin, its utilities and the <Hardware> component.
const styles = list(`${reg}/ui/hardware`, (f) => f.endsWith(".css") && f !== "devices.css")
items.push(
  item(
    "hardware",
    "registry:item",
    "Hardware",
    "Sets a project up for the hardware kit: the <Hardware> root, the skin's stylesheets, the IBM Plex Mono font, and the page-wide behaviors the components rely on (haptics, interaction sounds, keyboard-only focus rings, a block caret and Safari's Tab order).",
    [
      file(`${reg}/ui/hardware.tsx`, "registry:ui"),
      ...styles.map((f) => file(`${reg}/ui/hardware/${f}`, "registry:file")),
      ...list(`${reg}/lib`, (f) => f.endsWith(".ts")).map((f) => file(`${reg}/lib/${f}`, "registry:lib")),
    ],
    {
      css: { [fontImport]: {} },
      docs: "Wrap your app (or any part of it) in <Hardware> from @/components/ui/hardware; everything inside is styled by the skin. Set keyColor={{ l: 0.64, c: 0.31, h: 48 }} for an orange-red key color. IBM Plex Mono is imported at the top of your CSS file.",
      categories: ["theme"],
    },
  ),
)

// Components.
for (const f of list(`${reg}/ui`, (f) => f.endsWith(".tsx") && f !== "hardware.tsx")) {
  const name = f.replace(/\.tsx$/, "")
  const meta = components[name]
  if (!meta) throw new Error(`no title and description for ui/${f}`)
  const files = [file(`${reg}/ui/${f}`, "registry:ui")]
  if (name === "device") files.push(file(`${reg}/ui/hardware/devices.css`, "registry:file"))
  items.push(item(name, "registry:ui", meta[0], meta[1], files, { after: ["hardware"] }))
}

// Examples, named after the component they show.
for (const f of list(`${reg}/examples`, (f) => f.endsWith(".tsx"))) {
  const name = f.replace(/\.tsx$/, "")
  const shown = dependenciesOf([`${reg}/examples/${f}`], name).items
  const main = shown.find((n) => components[n]) ?? shown[0]
  const title = components[main]?.[0] ?? name
  items.push(
    item(name, "registry:component", `${title} demo`, `How to use ${title.toLowerCase()}, as the catalog shows it.`, [
      file(`${reg}/examples/${f}`, "registry:component"),
    ], { after: ["hardware"], categories: ["example"] }),
  )
}

// Devices.
for (const dir of list(`${reg}/blocks`)) {
  const meta = blocks[dir]
  if (!meta) throw new Error(`no title and description for blocks/${dir}`)
  const files = list(`${reg}/blocks/${dir}`, (f) => /\.tsx?$/.test(f)).map((f) => file(`${reg}/blocks/${dir}/${f}`, "registry:component"))
  items.push(item(dir, "registry:block", meta[0], meta[1], files, { after: ["hardware", "device"], categories: ["device"] }))
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "spec-01",
  homepage: base,
  items,
}
writeFileSync(join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
console.log(`registry.json: ${items.length} items (${base})`)

execFileSync(join(root, "node_modules/.bin/shadcn"), ["build", "--output", "public/r"], { cwd: root, stdio: "inherit" })

// Photos the examples and devices show live on this site, at /photos/...;
// installed elsewhere they load from here.
let rewritten = 0
for (const f of list("public/r", (f) => f.endsWith(".json"))) {
  const path = join(root, "public/r", f)
  const text = readFileSync(path, "utf8")
  const next = text.replaceAll('\\"/photos/', `\\"${base}/photos/`)
  if (next !== text) writeFileSync(path, next), rewritten++
}
console.log(`photo paths made absolute in ${rewritten} items`)
