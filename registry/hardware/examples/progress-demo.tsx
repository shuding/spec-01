import { Progress } from "@/registry/hardware/ui/progress"

export default function ProgressDemo() {
  return (
    <>
      <Progress label="Uploading" value={42} />
    </>
  )
}
