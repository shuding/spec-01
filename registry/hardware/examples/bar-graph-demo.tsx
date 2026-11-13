import * as React from "react"
import { BarGraph } from "@/registry/hardware/ui/bar-graph"

// Twelve levels that drift a little every 700ms, like a live meter. They
// hold still for anyone who prefers reduced motion.
export default function BarGraphDemo() {
  const [levels, setLevels] = React.useState([0.32, 0.4, 0.62, 0.78, 0.84, 0.71, 0.66, 0.74, 0.58, 0.44, 0.5, 0.61])
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      setLevels((list) => list.map((v) => Math.min(1, Math.max(0.08, v + (Math.random() - 0.5) * 0.18))))
    }, 700)
    return () => clearInterval(id)
  }, [])
  return (
    <div data-bar-graph-demo>
      <BarGraph label="Traffic" values={levels} segments={16} />
    </div>
  )
}
