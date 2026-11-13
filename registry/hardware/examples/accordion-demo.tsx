import { Accordion } from "@/registry/hardware/ui/accordion"

export default function AccordionDemo() {
  return (
    <>
      <Accordion
        items={[
          {
            value: "storage",
            label: "Storage",
            body: "64 GB internal. Projects back up to your computer over USB-C.",
          },
          {
            value: "battery",
            label: "Battery",
            body: "About 16 hours of playback. Charges to 80% in an hour.",
          },
          {
            value: "updates",
            label: "Updates",
            body: "New features arrive as free updates, installed from the device.",
          },
        ]}
      />
    </>
  )
}
