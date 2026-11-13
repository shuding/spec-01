import * as React from "react"
import { AlertDialog as SdkAlertDialog, AlertDialogBackdrop, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@ui-sdk/react/alert-dialog"
import { Icon } from "@/registry/hardware/ui/icon"

function AlertDialog({
  trigger,
  label,
  title,
  description,
  confirm,
  onConfirm,
}: {
  trigger: React.ReactNode
  /** The trigger's accessible name, for a trigger that's only an icon. */
  label?: string
  title: string
  description: string
  confirm: string
  onConfirm?: () => void
}) {
  return (
    <SdkAlertDialog>
      <AlertDialogTrigger data-kit="button" data-tone="secondary" aria-label={label}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogBackdrop data-kit="backdrop" />
      <AlertDialogContent data-kit="dialog">
        <div data-kit="dialog-surface">
          <AlertDialogTitle data-kit="dialog-title">{title}</AlertDialogTitle>
          <AlertDialogDescription data-kit="dialog-description">{description}</AlertDialogDescription>
          <div data-kit="actions">
            <AlertDialogClose data-kit="button" data-tone="secondary">
              <Icon name="close" />
              Cancel
            </AlertDialogClose>
            <AlertDialogClose data-kit="button" data-tone="primary" value="confirm" onClick={onConfirm}>
              <Icon name="trash" />
              {confirm}
            </AlertDialogClose>
          </div>
        </div>
      </AlertDialogContent>
    </SdkAlertDialog>
  )
}

export { AlertDialog }
