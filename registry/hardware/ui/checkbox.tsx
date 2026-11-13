import * as React from "react"
import { Icon } from "@/registry/hardware/ui/icon"
import { Checkbox as SdkCheckbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"

// With an icon, the latching key shows the icon on its cap and the label
// only names it for screen readers.
function Checkbox({
  label,
  icon,
  defaultChecked,
  onCheckedChange,
}: {
  label: string
  icon?: React.ComponentProps<typeof Icon>["name"]
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <label data-kit="check" data-icon={icon ? "" : undefined}>
      <SdkCheckbox
        data-kit="checkbox"
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange && ((checked) => onCheckedChange(checked === true))}
      >
        <CheckboxIndicator data-kit="checkbox-indicator" keepMounted />
        {icon && (
          <span data-kit="check-icon" aria-hidden>
            <Icon name={icon} />
          </span>
        )}
      </SdkCheckbox>
      <span data-kit={icon ? "visually-hidden" : "label"}>{label}</span>
    </label>
  )
}

export { Checkbox }
