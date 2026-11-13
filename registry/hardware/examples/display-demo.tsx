import { Display } from "@/registry/hardware/ui/display"

const highlands = "/photos/highlands.jpg"

export default function DisplayDemo() {
  return (
    <>
      <Display label="Highlands" aspect="21 / 9">
        <img src={highlands} alt="A road winding through green highlands under low cloud" draggable={false} />
      </Display>
    </>
  )
}
