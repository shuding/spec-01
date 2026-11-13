import { ContextMenuArea } from "@/registry/hardware/ui/context-menu"

export default function ContextMenuDemo() {
  return (
    <>
      <ContextMenuArea label="Right-click" touchLabel="Long-press" items={["Copy", "Paste", "Duplicate", "Delete"]} />
    </>
  )
}
