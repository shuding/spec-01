import * as React from "react"
import { ItemList } from "@/registry/hardware/ui/item-list"

const deploys = [
  { id: "d41", name: "web", branch: "main", age: "2m", status: "Ready" },
  { id: "d40", name: "api", branch: "main", age: "18m", status: "Ready" },
  { id: "d39", name: "web", branch: "fix/nav", age: "1h", status: "Error" },
  { id: "d38", name: "docs", branch: "main", age: "3h", status: "Ready" },
]

export default function ItemListDemo() {
  const [chosen, setChosen] = React.useState("d40")
  return (
    <ItemList
      label="Deployments"
      rows={deploys}
      rowKey={(row) => row.id}
      value={chosen}
      onValueChange={setChosen}
      columns={[
        { key: "id", label: "Id", width: "34px", render: (row) => row.id },
        { key: "name", label: "Project", width: "minmax(0, 1fr)", render: (row) => row.name },
        { key: "branch", label: "Branch", width: "minmax(0, 1fr)", render: (row) => row.branch },
        { key: "status", label: "Status", width: "48px", render: (row) => row.status },
        { key: "age", label: "Age", width: "30px", align: "end", render: (row) => row.age },
      ]}
    />
  )
}
