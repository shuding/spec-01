import { ModeDial } from "@/registry/hardware/ui/mode-dial"

export default function ModeDialDemo() {
  return (
    <>
      <div data-mode-dial-row>
        <ModeDial
          label="Effort"
          defaultValue="high"
          options={["low", "medium", "high", "xhigh", "max"].map((n) => ({ value: n, label: n }))}
        />
        <ModeDial
          label="Bank"
          defaultValue="3"
          sweep={180}
          options={["1", "2", "3", "4", "5"].map((n) => ({ value: n, label: n }))}
        />
      </div>
    </>
  )
}
