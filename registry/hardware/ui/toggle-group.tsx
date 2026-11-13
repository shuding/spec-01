import { Toggle, ToggleGroup as SdkToggleGroup } from "@ui-sdk/react/toggle"
import { Icon, type IconName } from "@/registry/hardware/ui/icon"

function ToggleGroup({
  label,
  options,
  defaultValue,
}: {
  label: string
  options: string[]
  defaultValue: string
}) {
  return (
    <SdkToggleGroup data-kit="toolbar" aria-label={label} defaultValue={[defaultValue]}>
      {options.map((option) => (
        <Toggle key={option} value={option} data-kit="toggle" aria-label={option}>
          <Icon name={`align-${option}` as IconName} />
        </Toggle>
      ))}
    </SdkToggleGroup>
  )
}

export { ToggleGroup }
