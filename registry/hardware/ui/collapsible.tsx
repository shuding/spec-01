import * as React from "react"
import { Collapsible as SdkCollapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible"

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SdkCollapsible data-kit="collapsible">
      <CollapsibleTrigger data-kit="accordion-trigger">{title}</CollapsibleTrigger>
      <CollapsiblePanel data-kit="accordion-panel">
        <p>{children}</p>
      </CollapsiblePanel>
    </SdkCollapsible>
  )
}

export { Collapsible }
