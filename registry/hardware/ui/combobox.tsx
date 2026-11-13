import { Combobox as SdkCombobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger } from "@ui-sdk/react/combobox"
import { Icon } from "@/registry/hardware/ui/icon"

function Combobox({ label, options }: { label: string; options: string[] }) {
  return (
    <SdkCombobox data-kit="field">
      <ComboboxLabel data-kit="label">{label}</ComboboxLabel>
      <div data-kit="input-group">
        <ComboboxInput data-kit="input" placeholder="Search…" />
        <ComboboxTrigger data-kit="input-addon" aria-label={`Show ${label.toLowerCase()}`}>
          <Icon name="chevron-down" />
        </ComboboxTrigger>
      </div>
      <ComboboxContent data-kit="popup" data-screen align="start">
        <ComboboxEmpty data-kit="empty">No matches.</ComboboxEmpty>
        <ComboboxList>
          {options.map((option) => (
            <ComboboxItem key={option} value={option} label={option} data-kit="option">
              {option}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </SdkCombobox>
  )
}

export { Combobox }
