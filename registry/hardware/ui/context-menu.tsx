import { chosenItem } from "@/registry/hardware/lib/chosen-item"
import { Menu, MenuContent, MenuContextTrigger, MenuItem } from "@ui-sdk/react/menu"

// On a touch screen the menu opens on a long press (ui-sdk binds it, since
// iOS sends no contextmenu event), so the area says so there.
const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches

function ContextMenuArea({ label, touchLabel = label, items }: { label: string; touchLabel?: string; items: string[] }) {
  return (
    <Menu>
      <MenuContextTrigger data-kit="context-area">{coarse ? touchLabel : label}</MenuContextTrigger>
      <MenuContent data-kit="popup" sideOffset={14}>
        {items.map((item) => (
          <MenuItem key={item} value={item} data-kit="option" {...chosenItem}>
            {item}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export { ContextMenuArea }
