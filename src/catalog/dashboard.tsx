import * as React from "react"
import { Icon, type IconName } from "@/registry/hardware/ui/icon"
import { HoverCard } from "@/registry/hardware/ui/hover-card"
import { sdkChain } from "./sdk-chain"

// A module key as the chain knows it: "slider" is @ui-sdk/react/slider,
// "core/pagination" is @ui-sdk/core/pagination used directly.
const chainKey = (use: string) => (use.includes("/") ? use : `react/${use}`)

// Foundation APIs grouped by where they're imported from:
// "core/number: clamp, formatNumber".
function byArea(entries: string[]) {
  const areas = new Map<string, string[]>()
  for (const entry of entries) {
    const [from, name] = entry.split("|")
    if (!areas.has(from)) areas.set(from, [])
    areas.get(from)!.push(name)
  }
  return [...areas].map(([from, names]) => `${from}: ${names.join(", ")}`)
}

// What a panel's component is made of: its UI SDK behaviors, and the core
// APIs and foundation behaviors underneath them.
function SdkChain({ uses }: { uses: string[] }) {
  const core = new Set<string>()
  const foundation = new Set<string>()
  for (const use of uses) {
    const entry = sdkChain[chainKey(use)]
    entry?.core.forEach((name) => core.add(name))
    entry?.foundation.forEach((name) => foundation.add(name))
  }
  // Markup and style only, with no behavior to build on: said outright, so
  // every panel answers what it's made of.
  if (!core.size && !foundation.size)
    return (
      <dl data-kit="sdk-chain" style={{ "--i": 0 } as React.CSSProperties}>
        <dt>core</dt>
        <dd>none, presentational</dd>
      </dl>
    )
  return (
    <dl data-kit="sdk-chain" style={{ "--i": 0 } as React.CSSProperties}>
      <dt>behavior</dt>
      <dd>{uses.map((use) => use.replace(/^core\//, "")).join(" · ")}</dd>
      {core.size > 0 && (
        <>
          <dt>core</dt>
          <dd>{[...core].sort().join(" · ")}</dd>
        </>
      )}
      {foundation.size > 0 && (
        <>
          <dt>foundation</dt>
          <dd>{byArea([...foundation].sort()).join(" · ")}</dd>
        </>
      )}
    </dl>
  )
}

// A titled section: flat, a card; with --projection, the ground its controls
// stand on.
function Panel({
  n,
  title,
  uses,
  wide,
  tall,
  children,
}: {
  n?: string
  /** The component's name: the caption, and the panel's accessible name. */
  title: string
  /** The UI SDK modules the component is built on: "slider" for
   *  @ui-sdk/react/slider, "core/pagination" for a core API used directly.
   *  The caption's name opens a card listing the core APIs and foundation
   *  behaviors underneath. An empty list marks a purely presentational
   *  component, which the card says. */
  uses?: string[]
  wide?: boolean
  tall?: boolean
  children: React.ReactNode
}) {
  return (
    <section data-kit="module" data-wide={wide || undefined} data-tall={tall || undefined} aria-label={title}>
      <h2 data-kit="caption">
        {n && <span>{n}</span>}
        {uses ? (
          <HoverCard
            triggerKit="chain-trigger"
            variant="chain"
            trigger={title}
          >
            <SdkChain uses={uses} />
          </HoverCard>
        ) : (
          title
        )}
      </h2>
      <div data-kit="stage">
        <div data-kit="surface">{children}</div>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  delta,
  trend,
}: {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
}) {
  return (
    <div data-kit="stat">
      <span data-kit="label">{label}</span>
      <strong data-kit="stat-value">{value}</strong>
      <span data-kit="stat-delta" data-trend={trend}>
        {delta}
      </span>
    </div>
  )
}

// Values from 0 to 1. Each bar carries its share as --value for the stylesheet to draw.
function Bars({ label, values, labels }: { label: string; values: number[]; labels: string[] }) {
  return (
    <figure data-kit="bars" aria-label={label}>
      <div
        data-kit="bars-plot"
        role="img"
        aria-label={`${label}: ${values.map((v, i) => `${labels[i]} ${Math.round(v * 100)}%`).join(", ")}`}
      >
        {values.map((value, index) => (
          <span key={index} data-kit="bar" style={{ "--value": value } as React.CSSProperties} />
        ))}
      </div>
      <figcaption data-kit="bars-axis" aria-hidden>
        {labels.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </figcaption>
    </figure>
  )
}

// The app frame: a sidebar, a top bar and the page.
function Shell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div data-kit="shell">
      <aside data-kit="sidebar">{sidebar}</aside>
      <div data-kit="main">
        <header data-kit="topbar">{topbar}</header>
        <div data-kit="content">{children}</div>
      </div>
    </div>
  )
}

function NavItem({
  label,
  icon,
  current,
  count,
}: {
  label: string
  icon: IconName
  current?: boolean
  count?: number
}) {
  return (
    <a data-kit="nav-item" tabIndex={0} aria-current={current ? "page" : undefined}>
      <span data-kit="nav-glyph" aria-hidden>
        <Icon name={icon} />
      </span>
      {label}
      {count !== undefined && <span data-kit="nav-count">{count}</span>}
    </a>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav data-kit="nav-section" aria-label={label}>
      <span data-kit="nav-heading">{label}</span>
      {children}
    </nav>
  )
}

export { Bars, NavItem, NavSection, Panel, Shell, Stat }
