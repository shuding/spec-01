import { Tabs } from "@/registry/hardware/ui/tabs"

export default function TabsDemo() {
  return (
    <>
      <Tabs
        items={[
          {
            value: "mix",
            label: "Mix",
            body: "Levels, pan and sends for every track on the current pattern.",
          },
          {
            value: "edit",
            label: "Edit",
            body: "Trim, loop and reverse the selected sample. Changes are non-destructive.",
          },
          {
            value: "fx",
            label: "FX",
            body: "Two effect slots per track: punch-in filters, delay and tape stop.",
          },
        ]}
      />
    </>
  )
}
