import { Dialog } from "@/registry/hardware/ui/dialog"

export default function DialogDemo() {
  return (
    <>
      <Dialog
        trigger="Delete"
        title="Delete untitled_04?"
        description="The project and its 12 samples are removed from this device."
        confirm="Delete"
      />
    </>
  )
}
