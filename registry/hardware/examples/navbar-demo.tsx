import * as React from "react"
import { Navbar } from "@/registry/hardware/ui/navbar"

const river = "/photos/river.jpg"

// The navbar over a photo, so its acrylic shows. Its pages switch in place
// rather than linking away.
const navbarPages = ["Layout", "Routing", "Export"] as const

export default function NavbarDemo() {
  const [page, setPage] = React.useState<(typeof navbarPages)[number]>("Layout")
  return (
    <div data-navbar-demo>
      <img src={river} alt="" draggable={false} />
      <Navbar
        label="Example pages"
        items={navbarPages.map((name) => ({ label: name, current: name === page, onSelect: () => setPage(name) }))}
      />
    </div>
  )
}
