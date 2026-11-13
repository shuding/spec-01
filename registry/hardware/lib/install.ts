import { installBlockCaret } from "@/registry/hardware/lib/block-caret"
import { installHaptics } from "@/registry/hardware/lib/haptics"
import { installInputModality } from "@/registry/hardware/lib/input-modality"
import { installSafariTabbing } from "@/registry/hardware/lib/safari-tabbing"
import { installSound } from "@/registry/hardware/lib/sound"

// The page-wide behaviors the skin relies on: the block caret, haptics and
// sounds, keyboard-only focus rings and Safari's Tab order. Each listens at
// the document, so they're installed once, however many roots there are.
let installed = false

function installHardware() {
  if (installed || typeof document === "undefined") return
  installed = true
  installBlockCaret()
  installHaptics()
  installSound()
  installSafariTabbing()
  installInputModality()
}

export { installHardware }
