import * as React from "react"
import { Drawer as SdkDrawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@ui-sdk/react/drawer"
import { Icon } from "@/registry/hardware/ui/icon"

function Drawer({
  trigger,
  title,
  description,
  children,
}: {
  trigger: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  // The pointer driver everywhere. On a touch screen ui-sdk would pick its
  // scroll-snap driver, whose opening throws in Safari (setting startTime on
  // its scroll-driven animations), leaving the drawer parked off screen.
  return (
    <SdkDrawer driver="pointer">
      <DrawerTrigger data-kit="button" data-tone="secondary">
        <Icon name="filter" />
        {trigger}
      </DrawerTrigger>
      <DrawerBackdrop data-kit="backdrop" />
      <DrawerContent data-kit="drawer">
        <div data-kit="drawer-body">
          <span data-kit="drawer-grip" aria-hidden />
          <header data-kit="drawer-head">
            <DrawerTitle data-kit="dialog-title">{title}</DrawerTitle>
            <DrawerDescription data-kit="dialog-description">{description}</DrawerDescription>
          </header>
          {children && <div data-kit="drawer-content">{children}</div>}
          <div data-kit="actions">
            <DrawerClose data-kit="button" data-tone="secondary">
              <Icon name="close" />
              Cancel
            </DrawerClose>
            <DrawerClose data-kit="button" data-tone="primary">
              <Icon name="check" />
              Apply
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </SdkDrawer>
  )
}

export { Drawer }
