import * as React from "react"

// A navigation bar on a floating plate of frosted acrylic: what's behind it
// blurs through, under a polished edge. The links are printed like the
// inputs on an amplifier's selector, each with a small LED beside it; the
// current page's LED is lit.
// Links don't drag: pressing one is a press, not the start of a drag.
function Navbar({
  brand,
  leading,
  label = "Pages",
  items,
  children,
}: {
  brand?: { href: string; name: string; model?: string }
  /** Shown at the bar's start in place of a brand, before the links. */
  leading?: React.ReactNode
  label?: string
  /** An item with `onSelect` switches something in place instead of linking. */
  items: { href?: string; label: string; current?: boolean; onSelect?: () => void }[]
  children?: React.ReactNode
}) {
  const links = React.useRef<HTMLElement>(null)
  const current = items.findIndex((item) => item.current)
  // When the links scroll (a narrow screen), keep the current one centered.
  React.useLayoutEffect(() => {
    const el = links.current!
    const center = () => {
      const link = el.querySelector<HTMLElement>("[aria-current]")
      if (!link || el.scrollWidth <= el.clientWidth) return
      el.scrollTo({ left: link.offsetLeft - (el.clientWidth - link.offsetWidth) / 2, behavior: "smooth" })
    }
    center()
    const observer = new ResizeObserver(center)
    observer.observe(el)
    return () => observer.disconnect()
  }, [current])
  return (
    <header data-kit="navbar">
      {brand && (
        <a href={brand.href} data-kit="navbar-brand" draggable={false}>
          {brand.model && <span>{brand.model}</span>}
          <strong>{brand.name}</strong>
        </a>
      )}
      {leading}
      <nav ref={links} aria-label={label} data-kit="navbar-links">
        {items.map((item) =>
          item.onSelect ? (
            <button
              key={item.label}
              type="button"
              data-kit="navbar-link"
              aria-current={item.current ? "page" : undefined}
              onClick={item.onSelect}
            >
              {item.label}
            </button>
          ) : (
            <a
              key={item.label}
              href={item.href}
              data-kit="navbar-link"
              draggable={false}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          ),
        )}
      </nav>
      {children}
    </header>
  )
}

export { Navbar }
