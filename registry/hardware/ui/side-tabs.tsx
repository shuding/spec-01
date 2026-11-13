import * as React from "react"
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

type Side = "left" | "right" | "top"

// Tabs as a multi-position slide switch along the edge of a device, like a
// radio's band selector: a slot with a detent per section, each labeled, and
// a lever that snaps to the chosen one. On the left, the right or the top;
// arrows follow the edge.
function SideTabs({
  side = "right",
  items,
}: {
  side?: Side
  items: { value: string; label: string; content: React.ReactNode }[]
}) {
  return (
    <Tabs
      data-kit="side-tabs"
      data-side={side}
      orientation={side === "top" ? "horizontal" : "vertical"}
      defaultValue={items[0].value}
    >
      {side === "top" && <List items={items} />}
      <div data-kit="side-tabs-body">
        {items.map((item) => (
          <TabsPanel key={item.value} value={item.value} data-kit="side-tabs-panel">
            {item.content}
          </TabsPanel>
        ))}
      </div>
      {side !== "top" && <List items={items} />}
    </Tabs>
  )
}

function List({ items }: { items: { value: string; label: string }[] }) {
  return (
    <TabsList data-kit="side-tabs-list" aria-label="Sections">
      <TabsIndicator data-kit="side-lever" />
      {items.map((item) => (
        <TabsTab key={item.value} value={item.value} data-kit="side-tab">
          {item.label}
        </TabsTab>
      ))}
    </TabsList>
  )
}

export { SideTabs, type Side }
