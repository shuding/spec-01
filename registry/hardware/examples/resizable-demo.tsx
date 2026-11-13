import { Resizable } from "@/registry/hardware/ui/resizable"

export default function ResizableDemo() {
  return (
    <>
      <div data-resizable-demo>
        <Resizable left="Files" right="Editor" />
        <Resizable left="Preview" right="Console" orientation="vertical" />
      </div>
    </>
  )
}
