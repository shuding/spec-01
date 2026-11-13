import { Alert } from "@/registry/hardware/ui/alert"

export default function AlertDemo() {
  return (
    <>
      <Alert tone="warning" title="Usage at 82%">
        You'll reach your plan's limit in about 4 days.
      </Alert>
    </>
  )
}
