import { Dialog as SdkDialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"

function Dialog({
  trigger,
  title,
  description,
  confirm,
}: {
  trigger: string
  title: string
  description: string
  confirm: string
}) {
  return (
    <SdkDialog>
      <DialogTrigger data-kit="button" data-tone="secondary">
        {trigger}
      </DialogTrigger>
      <DialogBackdrop data-kit="backdrop" />
      <DialogContent data-kit="dialog">
        <div data-kit="dialog-surface">
          <DialogTitle data-kit="dialog-title">{title}</DialogTitle>
          <DialogDescription data-kit="dialog-description">{description}</DialogDescription>
          <div data-kit="actions">
            <DialogClose data-kit="button" data-tone="secondary">
              Cancel
            </DialogClose>
            <DialogClose data-kit="button" data-tone="primary">
              {confirm}
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </SdkDialog>
  )
}

export { Dialog }
