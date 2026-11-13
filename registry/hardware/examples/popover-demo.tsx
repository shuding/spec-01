import { Popover } from "@/registry/hardware/ui/popover"

export default function PopoverDemo() {
  return (
    <>
      <Popover
        trigger="Share"
        title="Share untitled_04"
        description="Anyone with the link can listen. They can't edit."
        confirm="Copy link"
      />
    </>
  )
}
