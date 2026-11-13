import { Icon } from "@/registry/hardware/ui/icon"
import { Tooltip } from "@/registry/hardware/ui/tooltip"

export default function TooltipDemo() {
  return (
    <>
      <Tooltip label="Tap tempo">
        <Icon name="info" />
      </Tooltip>
    </>
  )
}
