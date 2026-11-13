import { ToolbarGroup } from "@/registry/hardware/ui/toolbar"

export default function ToolbarDemo() {
  return (
    <>
      <ToolbarGroup
        label="Formatting"
        toggles={[
          { label: "Bold", icon: "bold", pressed: true },
          { label: "Italic", icon: "italic" },
          { label: "Underline", icon: "underline" },
        ]}
      />
    </>
  )
}
