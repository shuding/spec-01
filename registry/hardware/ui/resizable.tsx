import * as React from "react"
import { crosses, haptic } from "@/registry/hardware/lib/haptics"
import { Resizable as SdkResizable, ResizableHandle, ResizablePanel } from "@ui-sdk/react/resizable"

function Resizable({
  left,
  right,
  orientation = "horizontal",
}: {
  left: string
  right: string
  orientation?: "horizontal" | "vertical"
}) {
  // A tick for every 5% the handle travels, as it's dragged.
  const last = React.useRef(40)
  return (
    <SdkResizable
      data-kit="resizable"
      orientation={orientation}
      onLayoutChange={(layout) => {
        if (crosses(last.current, layout[0], 5)) haptic("selection")
        last.current = layout[0]
      }}
    >
      <ResizablePanel defaultSize={40} minSize={20} data-kit="resizable-panel">
        {left}
      </ResizablePanel>
      <ResizableHandle data-kit="resizable-handle" aria-label="Resize" />
      <ResizablePanel defaultSize={60} minSize={20} data-kit="resizable-panel">
        {right}
      </ResizablePanel>
    </SdkResizable>
  )
}

export { Resizable }
