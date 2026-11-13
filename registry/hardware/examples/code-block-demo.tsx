import { CodeBlock } from "@/registry/hardware/ui/code-block"

export default function CodeBlockDemo() {
  return (
    <>
      <CodeBlock language="ts" code={`import { createSlider } from "@ui-sdk/core"

// A fader that snaps to the beat.
const fader = createSlider(el, {
  min: 0,
  max: 127,
  step: 1,
  onValueChange: (value) => send("cc", 7, value),
})`} />
    </>
  )
}
