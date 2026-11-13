import * as React from "react"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Icon } from "@/registry/hardware/ui/icon"
import { Avatar } from "@/registry/hardware/ui/avatar"
import { Badge } from "@/registry/hardware/ui/badge"

type Row = {
  id: string
  name: string
  status: "Ready" | "Building" | "Error" | "Queued"
  branch: string
  author: string
  age: string
}

const statusTone = { Ready: "success", Building: "info", Error: "danger", Queued: "neutral" } as const

// A table with row selection: a header checkbox that checks all, and a menu per row.
function DataTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = React.useState<string[]>([])
  const all = selected.length === rows.length ? true : selected.length ? "indeterminate" : false
  return (
    <div data-kit="table-wrap">
      <table data-kit="table">
        <thead>
          <tr>
            <th data-kit="table-check">
              <Checkbox
                data-kit="checkbox"
                aria-label="Select all"
                checked={all}
                onCheckedChange={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
              >
                <CheckboxIndicator data-kit="checkbox-indicator" keepMounted />
              </Checkbox>
            </th>
            <th>Deployment</th>
            <th>Status</th>
            <th>Branch</th>
            <th>Author</th>
            <th>Age</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-selected={selected.includes(row.id) || undefined}>
              <td data-kit="table-check">
                <Checkbox
                  data-kit="checkbox"
                  aria-label={`Select ${row.name}`}
                  checked={selected.includes(row.id)}
                  onCheckedChange={(checked) =>
                    setSelected((list) => (checked ? [...list, row.id] : list.filter((id) => id !== row.id)))
                  }
                >
                  <CheckboxIndicator data-kit="checkbox-indicator" keepMounted />
                </Checkbox>
              </td>
              <td data-kit="table-strong">{row.name}</td>
              <td>
                <Badge tone={statusTone[row.status]}>{row.status}</Badge>
              </td>
              <td data-kit="mono">{row.branch}</td>
              <td>
                <span data-kit="row" data-align="start">
                  <Avatar name={row.author} size="sm" />
                  {row.author}
                </span>
              </td>
              <td data-kit="muted">{row.age}</td>
              <td>
                <Menu>
                  <MenuTrigger data-kit="icon-button" aria-label={`Actions for ${row.name}`}>
                    <Icon name="more" />
                  </MenuTrigger>
                  <MenuContent data-kit="popup" align="end" sideOffset={14}>
                    {["Visit", "Redeploy", "Promote", "Delete"].map((item) => (
                      <MenuItem key={item} value={item} data-kit="option">
                        {item}
                      </MenuItem>
                    ))}
                  </MenuContent>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { DataTable }
export type { Row }
