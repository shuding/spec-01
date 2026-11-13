import { Menu } from "@/registry/hardware/ui/menu"

export default function MenuDemo() {
  return (
    <>
      <Menu label="More" items={["Duplicate", "Rename", "Export", "Delete"]} />
    </>
  )
}
