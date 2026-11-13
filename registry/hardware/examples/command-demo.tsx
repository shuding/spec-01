import { CommandPalette } from "@/registry/hardware/ui/command-palette"
import { Switch } from "@/registry/hardware/ui/switch"

export default function CommandDemo() {
  return (
    <>
      <CommandPalette commands={["New project", "Invite member", "Open settings", "Switch theme"]} />
    </>
  )
}
