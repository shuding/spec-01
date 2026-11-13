import "./base.css"
import "@/registry/hardware/ui/hardware/skin.css"
import "./site.css"
import { StrictMode, useSyncExternalStore } from "react"
import { createRoot } from "react-dom/client"
import { installHardware } from "@/registry/hardware/lib/install"
import { Analytics } from "@vercel/analytics/react"
import { Site } from "./Site"

// Pages live at real paths: /, /music, /timer. Old hash links (#/music)
// move to their path, so shared links keep working.
if (location.hash.startsWith("#/")) {
  history.replaceState(null, "", `/${location.hash.slice(2).replace(/^\/+/, "")}${location.search}`)
}

const navigated = "spec01:navigate"
const subscribe = (notify: () => void) => {
  addEventListener("popstate", notify)
  addEventListener(navigated, notify)
  return () => {
    removeEventListener("popstate", notify)
    removeEventListener(navigated, notify)
  }
}
const useRoute = () => useSyncExternalStore(subscribe, () => location.pathname.replace(/^\/+|\/+$/g, ""))

// Same-site links navigate in place: the page changes without a reload.
// Links opening elsewhere (a new tab, a modifier key, a download, a file)
// are left to the browser.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
  if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return
  if (link.origin !== location.origin || /\.[a-z0-9]+$/i.test(link.pathname)) return
  event.preventDefault()
  if (link.pathname === location.pathname) return
  history.pushState(null, "", link.pathname)
  dispatchEvent(new Event(navigated))
  scrollTo(0, 0)
})

function App() {
  const route = useRoute()
  return (
    <>
      <Site route={route} />
      {/* Each page is a page view: the router hands Vercel Analytics the path. */}
      <Analytics route={`/${route}`} path={`/${route}`} />
    </>
  )
}


installHardware()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
