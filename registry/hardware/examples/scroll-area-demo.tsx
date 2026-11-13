import { ScrollArea } from "@/registry/hardware/ui/scroll-area"

export default function ScrollAreaDemo() {
  return (
    <>
      <ScrollArea
        label="Tags"
        items={["v2.14.0", "v2.13.4", "v2.13.3", "v2.13.2", "v2.13.1", "v2.13.0", "v2.12.9", "v2.12.8"]}
      />
    </>
  )
}
