import { Select } from "@/registry/hardware/ui/select"

export default function SelectDemo() {
  return (
    <>
      <Select
        label="Sample rate"
        defaultValue="48"
        options={[
          { value: "22.05", label: "22.05 kHz" },
          { value: "32", label: "32 kHz" },
          { value: "44.1", label: "44.1 kHz" },
          { value: "48", label: "48 kHz" },
          { value: "88.2", label: "88.2 kHz" },
          { value: "96", label: "96 kHz" },
          { value: "176.4", label: "176.4 kHz" },
          { value: "192", label: "192 kHz" },
        ]}
      />
    </>
  )
}
