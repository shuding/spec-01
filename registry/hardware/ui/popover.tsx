import { Popover as SdkPopover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"

function Popover({
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
    <SdkPopover>
      <PopoverTrigger data-kit="button" data-tone="secondary">
        {trigger}
      </PopoverTrigger>
      <PopoverContent data-kit="popover" side="top" align="center" sideOffset={18}>
        <div data-kit="popover-surface">
          <PopoverTitle data-kit="dialog-title">{title}</PopoverTitle>
          <PopoverDescription data-kit="dialog-description">{description}</PopoverDescription>
          <div data-kit="actions">
            <PopoverClose data-kit="button" data-tone="secondary">
              Cancel
            </PopoverClose>
            <PopoverClose data-kit="button" data-tone="primary">
              {confirm}
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </SdkPopover>
  )
}

export { Popover }
