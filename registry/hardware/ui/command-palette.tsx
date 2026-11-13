import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@ui-sdk/react/command"
import { Dialog, DialogBackdrop, DialogContent, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"
import { Icon } from "@/registry/hardware/ui/icon"

function CommandPalette({ commands }: { commands: string[] }) {
  return (
    <Dialog>
      <DialogTrigger data-kit="button" data-tone="secondary">
        <Icon name="search" />
        <span data-kit="trigger-text">Search…</span>
        <kbd data-kit="kbd">⌘K</kbd>
      </DialogTrigger>
      <DialogBackdrop data-kit="backdrop" />
      <DialogContent data-kit="dialog">
        <div data-kit="dialog-surface" data-size="command">
          <DialogTitle data-kit="visually-hidden">Command palette</DialogTitle>
          <Command data-kit="command">
            <CommandInput data-kit="input" aria-label="Search commands" placeholder="Type a command…" />
            <CommandEmpty data-kit="empty">No results.</CommandEmpty>
            <CommandList data-kit="command-list">
              {commands.map((command) => (
                <CommandItem key={command} value={command} data-kit="option">
                  {command}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { CommandPalette }
