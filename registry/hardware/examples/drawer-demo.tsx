import { Checkbox } from "@/registry/hardware/ui/checkbox"
import { Drawer } from "@/registry/hardware/ui/drawer"
import { Fieldset } from "@/registry/hardware/ui/fieldset"
import { Segmented } from "@/registry/hardware/ui/segmented-control"

export default function DrawerDemo() {
  return (
    <>
      <Drawer trigger="Filters" title="Filter deployments" description="Show only what you need.">
        <Fieldset legend="Environment">
          <Segmented label="Environment" options={["All", "Production", "Preview"]} defaultValue="All" />
        </Fieldset>
        <Fieldset legend="Status">
          <Checkbox label="Ready" defaultChecked />
          <Checkbox label="Building" defaultChecked />
          <Checkbox label="Error" />
        </Fieldset>
      </Drawer>
    </>
  )
}
