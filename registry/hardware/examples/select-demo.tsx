import { Select } from "@/registry/hardware/ui/select"

export default function SelectDemo() {
  return (
    <>
      <Select
        label="Sample rate"
        defaultValue="48"
        options={[
          { value: "8", label: "8 kHz" },
          { value: "11.025", label: "11.025 kHz" },
          { value: "12", label: "12 kHz" },
          { value: "16", label: "16 kHz" },
          { value: "22.05", label: "22.05 kHz" },
          { value: "24", label: "24 kHz" },
          { value: "32", label: "32 kHz" },
          { value: "37.8", label: "37.8 kHz" },
          { value: "44.056", label: "44.056 kHz" },
          { value: "44.1", label: "44.1 kHz" },
          { value: "47.25", label: "47.25 kHz" },
          { value: "48", label: "48 kHz" },
          { value: "50", label: "50 kHz" },
          { value: "50.4", label: "50.4 kHz" },
          { value: "64", label: "64 kHz" },
          { value: "88.2", label: "88.2 kHz" },
          { value: "96", label: "96 kHz" },
          { value: "176.4", label: "176.4 kHz" },
          { value: "192", label: "192 kHz" },
          { value: "352.8", label: "352.8 kHz" },
          { value: "384", label: "384 kHz" },
          { value: "705.6", label: "705.6 kHz" },
          { value: "768", label: "768 kHz" },
          { value: "2822.4", label: "2822.4 kHz" },
        ]}
      />
    </>
  )
}
