import { Menubar } from "@/registry/hardware/ui/menubar"

export default function MenubarDemo() {
  return (
    <>
      <Menubar
        menus={[
          { label: "File", items: [{ label: "New" }, { label: "Open" }, { label: "Save" }] },
          {
            label: "View",
            items: [
              { label: "Sidebar", checkable: true },
              { label: "Minimap", checkable: true },
            ],
          },
          { label: "Help", items: [{ label: "Docs" }, { label: "Shortcuts" }] },
        ]}
      />
    </>
  )
}
