import { chosenItem } from "@/registry/hardware/lib/chosen-item"
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuItemIndicator, MenuTrigger } from "@ui-sdk/react/menu"
import { Menubar as SdkMenubar } from "@ui-sdk/react/menubar"

function Menubar({ menus }: { menus: { label: string; items: { label: string; checkable?: boolean }[] }[] }) {
  return (
    <SdkMenubar data-kit="menubar">
      {menus.map((menu) => (
        <Menu key={menu.label}>
          <MenuTrigger data-kit="menubar-trigger">{menu.label}</MenuTrigger>
          <MenuContent data-kit="popup" align="start" sideOffset={14}>
            {menu.items.map((item) =>
              item.checkable ? (
                <MenuCheckboxItem key={item.label} value={item.label} data-kit="option" defaultChecked>
                  <MenuItemIndicator data-kit="option-check" keepMounted>
                    ✓
                  </MenuItemIndicator>
                  {item.label}
                </MenuCheckboxItem>
              ) : (
                <MenuItem key={item.label} value={item.label} data-kit="option" {...chosenItem}>
                  {item.label}
                </MenuItem>
              ),
            )}
          </MenuContent>
        </Menu>
      ))}
    </SdkMenubar>
  )
}

export { Menubar }
