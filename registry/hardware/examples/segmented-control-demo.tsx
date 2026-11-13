import { Segmented } from "@/registry/hardware/ui/segmented-control"

export default function SegmentedControlDemo() {
  return (
    <>
      <Segmented label="Pattern" options={["1", "2", "3", "4"]} defaultValue="1" />
    </>
  )
}
