import { Button } from "@/registry/hardware/ui/button"

export default function ButtonDemo() {
  return (
    <>
      <Button tone="primary">Play</Button>
      <Button>Stop</Button>
      <Button round aria-label="Record">
        <span data-kit="record-dot" aria-hidden />
      </Button>
    </>
  )
}
