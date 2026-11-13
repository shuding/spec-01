import { Toggle } from "@ui-sdk/react/toggle"
import { Toolbar as SdkToolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { Icon, type IconName } from "@/registry/hardware/ui/icon"

function ToolbarGroup({
  label,
  toggles,
}: {
  label: string
  toggles: { label: string; icon: IconName; pressed?: boolean }[]
}) {
  return (
    <SdkToolbar data-kit="toolbar" aria-label={label}>
      {toggles.map((toggle) => (
        <Toggle
          key={toggle.label}
          data-kit="toggle"
          aria-label={toggle.label}
          defaultPressed={toggle.pressed}
        >
          <Icon name={toggle.icon} />
        </Toggle>
      ))}
      <ToolbarSeparator data-kit="separator" />
      <ToolbarButton data-kit="toggle" aria-label="Clear formatting">
        <Icon name="erase" />
      </ToolbarButton>
    </SdkToolbar>
  )
}

export { ToolbarGroup }
