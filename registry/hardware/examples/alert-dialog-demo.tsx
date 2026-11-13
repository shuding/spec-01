import { AlertDialog } from "@/registry/hardware/ui/alert-dialog"
import { Icon } from "@/registry/hardware/ui/icon"

export default function AlertDialogDemo() {
  return (
    <>
      <AlertDialog
        trigger={
          <>
            <Icon name="trash" />
            Delete project
          </>
        }
        title="Delete untitled_04?"
        description="This can't be undone. Every deployment and domain is removed."
        confirm="Delete"
      />
    </>
  )
}
