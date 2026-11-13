import * as React from "react"
import { ButtonGroup } from "@/registry/hardware/ui/button-group"
import { Icon } from "@/registry/hardware/ui/icon"

export default function RockerDemo() {
  const [playing, setPlaying] = React.useState(false)
  const none = () => {}
  return (
    <div data-rocker-demo>
      <ButtonGroup
        label="Level"
        parts={[
          { label: "Down", content: <Icon name="minus" />, onPress: none, repeat: true },
          { label: "Up", content: <Icon name="plus" />, onPress: none, repeat: true },
        ]}
      />
      <ButtonGroup
        label="Volume"
        orientation="vertical"
        parts={[
          { label: "Volume up", content: <Icon name="plus" />, onPress: none, repeat: true },
          { label: "Volume down", content: <Icon name="minus" />, onPress: none, repeat: true },
        ]}
      />
      <ButtonGroup
        label="Transport"
        tone="primary"
        parts={[
          { label: "Previous", content: <Icon name="prev" />, onPress: none },
          { label: playing ? "Pause" : "Play", content: <Icon name={playing ? "pause" : "play"} />, onPress: () => setPlaying((p) => !p) },
          { label: "Next", content: <Icon name="next" />, onPress: none },
        ]}
      />
    </div>
  )
}
