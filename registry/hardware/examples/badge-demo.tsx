import { Badge } from "@/registry/hardware/ui/badge"

export default function BadgeDemo() {
  return (
    <>
      <Badge tone="success">Ready</Badge>
      <Badge tone="info">Building</Badge>
      <Badge tone="warning">Degraded</Badge>
      <Badge tone="danger">Error</Badge>
      <Badge tone="neutral">Queued</Badge>
    </>
  )
}
