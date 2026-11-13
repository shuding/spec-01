import * as React from "react"
import { Panel } from "./dashboard"
import ButtonDemo from "@/registry/hardware/examples/button-demo"
import SwitchDemo from "@/registry/hardware/examples/switch-demo"
import CheckboxDemo from "@/registry/hardware/examples/checkbox-demo"
import SegmentedControlDemo from "@/registry/hardware/examples/segmented-control-demo"
import SliderDemo from "@/registry/hardware/examples/slider-demo"
import FlatKnobDemo from "@/registry/hardware/examples/flat-knob-demo"
import TextFieldDemo from "@/registry/hardware/examples/text-field-demo"
import SelectDemo from "@/registry/hardware/examples/select-demo"
import MeterDemo from "@/registry/hardware/examples/meter-demo"
import MenuDemo from "@/registry/hardware/examples/menu-demo"
import DialogDemo from "@/registry/hardware/examples/dialog-demo"
import TabsDemo from "@/registry/hardware/examples/tabs-demo"
import CalendarDemo from "@/registry/hardware/examples/calendar-demo"
import RadioGroupDemo from "@/registry/hardware/examples/radio-group-demo"
import NumberStepperDemo from "@/registry/hardware/examples/number-stepper-demo"
import AccordionDemo from "@/registry/hardware/examples/accordion-demo"
import ToolbarDemo from "@/registry/hardware/examples/toolbar-demo"
import PaginationDemo from "@/registry/hardware/examples/pagination-demo"
import TooltipDemo from "@/registry/hardware/examples/tooltip-demo"
import PopoverDemo from "@/registry/hardware/examples/popover-demo"
import ToastExample from "@/registry/hardware/examples/toast-demo"
import ComboboxDemo from "@/registry/hardware/examples/combobox-demo"
import DatePickerDemo from "@/registry/hardware/examples/date-picker-demo"
import TextareaDemo from "@/registry/hardware/examples/textarea-demo"
import OTPInputDemo from "@/registry/hardware/examples/otp-input-demo"
import ToggleGroupDemo from "@/registry/hardware/examples/toggle-group-demo"
import MenubarDemo from "@/registry/hardware/examples/menubar-demo"
import ContextMenuDemo from "@/registry/hardware/examples/context-menu-demo"
import CommandDemo from "@/registry/hardware/examples/command-demo"
import AlertDialogDemo from "@/registry/hardware/examples/alert-dialog-demo"
import DrawerDemo from "@/registry/hardware/examples/drawer-demo"
import HoverCardDemo from "@/registry/hardware/examples/hover-card-demo"
import AlertDemo from "@/registry/hardware/examples/alert-demo"
import BadgeDemo from "@/registry/hardware/examples/badge-demo"
import AvatarDemo from "@/registry/hardware/examples/avatar-demo"
import BreadcrumbDemo from "@/registry/hardware/examples/breadcrumb-demo"
import ProgressDemo from "@/registry/hardware/examples/progress-demo"
import CollapsibleDemo from "@/registry/hardware/examples/collapsible-demo"
import CarouselDemo from "@/registry/hardware/examples/carousel-demo"
import ResizableDemo from "@/registry/hardware/examples/resizable-demo"
import ScrollAreaDemo from "@/registry/hardware/examples/scroll-area-demo"
import SeparatorDemo from "@/registry/hardware/examples/separator-demo"
import BarGraphDemo from "@/registry/hardware/examples/bar-graph-demo"
import DisplayDemo from "@/registry/hardware/examples/display-demo"
import ItemListDemo from "@/registry/hardware/examples/item-list-demo"
import DPadDemo from "@/registry/hardware/examples/d-pad-demo"
import ModeDialDemo from "@/registry/hardware/examples/mode-dial-demo"
import RockerDemo from "@/registry/hardware/examples/button-group-demo"
import NavbarDemo from "@/registry/hardware/examples/navbar-demo"
import LCDDemo from "@/registry/hardware/examples/lcd-demo"
import SlideSwitchDemo from "@/registry/hardware/examples/slide-switch-demo"
import CodeBlockDemo from "@/registry/hardware/examples/code-block-demo"

// Dense packing lets later panels fill holes left by wide ones. A hole that
// packing can't fill, like a wide panel alone in a three-column row, is
// taken up by widening the panel just before it.
function useFilledGrid() {
  const grid = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const el = grid.current!
    const fill = () => {
      const panels = [...el.children] as HTMLElement[]
      for (const panel of panels) panel.style.removeProperty("grid-column")
      const columns = getComputedStyle(el).gridTemplateColumns.split(" ").length
      if (columns < 2) return
      const box = el.getBoundingClientRect()
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const column = (box.width + gap) / columns
      const place = (panel: HTMLElement) => {
        const r = panel.getBoundingClientRect()
        return {
          panel,
          top: Math.round(r.top),
          start: Math.round((r.left - box.left) / column),
          span: Math.round((r.width + gap) / column),
        }
      }
      const rows = new Map<number, ReturnType<typeof place>[]>()
      for (const item of panels.map(place)) rows.set(item.top, [...(rows.get(item.top) ?? []), item])
      for (const row of rows.values()) {
        row.sort((a, b) => a.start - b.start)
        row.forEach((item, i) => {
          const next = row[i + 1]?.start ?? columns
          const empty = next - (item.start + item.span)
          if (empty > 0) item.panel.style.gridColumn = `${item.start + 1} / span ${item.span + empty}`
        })
        const first = row[0]
        if (first && first.start > 0) first.panel.style.gridColumn = `1 / span ${first.start + first.span}`
      }
    }
    fill()
    const observer = new ResizeObserver(fill)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return grid
}

function CatalogGrid() {
  const grid = useFilledGrid()
  return (
    <div data-kit="grid" ref={grid}>
      <Panel n="01" title="Button" uses={["button"]}>
        <ButtonDemo />
      </Panel>
      <Panel n="02" title="Switch" uses={["switch"]}>
        <SwitchDemo />
      </Panel>
      <Panel n="03" title="Checkbox" uses={["checkbox"]}>
        <CheckboxDemo />
      </Panel>
      <Panel n="04" title="Segmented control" uses={["segmented-control", "field"]}>
        <SegmentedControlDemo />
      </Panel>
      <Panel n="05" title="Slider" uses={["slider", "field"]} wide>
        <SliderDemo />
      </Panel>
      <Panel n="06" title="Flat knob" uses={["number-input"]} wide>
        <FlatKnobDemo />
      </Panel>
      <Panel n="07" title="Text field" uses={["input", "field"]}>
        <TextFieldDemo />
      </Panel>
      <Panel n="08" title="Select" uses={["listbox", "field"]}>
        <SelectDemo />
      </Panel>
      <Panel n="09" title="Meter" uses={["meter"]}>
        <MeterDemo />
      </Panel>
      <Panel n="10" title="Menu" uses={["menu"]}>
        <MenuDemo />
      </Panel>
      <Panel n="11" title="Dialog" uses={["dialog"]}>
        <DialogDemo />
      </Panel>
      <Panel n="12" title="Tabs" uses={["tabs"]} wide>
        <TabsDemo />
      </Panel>
      <Panel n="13" title="Calendar" uses={["core/date"]} wide>
        <CalendarDemo />
      </Panel>
      <Panel n="14" title="Radio group" uses={["radio", "field"]}>
        <RadioGroupDemo />
      </Panel>
      <Panel n="15" title="Number stepper" uses={["number-input", "field"]}>
        <NumberStepperDemo />
      </Panel>
      <Panel n="16" title="Accordion" uses={["accordion"]} wide>
        <AccordionDemo />
      </Panel>
      <Panel n="17" title="Toolbar" uses={["toolbar", "toggle"]}>
        <ToolbarDemo />
      </Panel>
      <Panel n="18" title="Pagination" uses={["pagination"]} wide>
        <PaginationDemo />
      </Panel>
      <Panel n="19" title="Tooltip" uses={["tooltip"]}>
        <TooltipDemo />
      </Panel>
      <Panel n="20" title="Popover" uses={["popover"]}>
        <PopoverDemo />
      </Panel>
      <Panel n="21" title="Toast" uses={["toast"]}>
        <ToastExample />
      </Panel>
      <Panel n="22" title="Combobox" uses={["combobox"]}>
        <ComboboxDemo />
      </Panel>
      <Panel n="23" title="Date picker" uses={["date-picker", "field"]}>
        <DatePickerDemo />
      </Panel>
      <Panel n="24" title="Textarea" uses={["textarea", "field"]}>
        <TextareaDemo />
      </Panel>
      <Panel n="25" title="OTP input" uses={["otp-input", "field"]} wide>
        <OTPInputDemo />
      </Panel>
      <Panel n="26" title="Toggle group" uses={["toggle"]}>
        <ToggleGroupDemo />
      </Panel>
      <Panel n="27" title="Menubar" uses={["menubar", "menu"]} wide>
        <MenubarDemo />
      </Panel>
      <Panel n="28" title="Context menu" uses={["menu"]}>
        <ContextMenuDemo />
      </Panel>
      <Panel n="29" title="Command" uses={["command", "dialog"]}>
        <CommandDemo />
      </Panel>
      <Panel n="30" title="Alert dialog" uses={["alert-dialog"]}>
        <AlertDialogDemo />
      </Panel>
      <Panel n="31" title="Drawer" uses={["drawer"]}>
        <DrawerDemo />
      </Panel>
      <Panel n="32" title="Hover card" uses={["hover-card"]}>
        <HoverCardDemo />
      </Panel>
      <Panel n="33" title="Alert" uses={[]} wide>
        <AlertDemo />
      </Panel>
      <Panel n="34" title="Badge" uses={[]}>
        <BadgeDemo />
      </Panel>
      <Panel n="35" title="Avatar" uses={["avatar"]}>
        <AvatarDemo />
      </Panel>
      <Panel n="36" title="Breadcrumb" uses={[]}>
        <BreadcrumbDemo />
      </Panel>
      <Panel n="37" title="Progress" uses={["progress"]}>
        <ProgressDemo />
      </Panel>
      <Panel n="38" title="Collapsible" uses={["collapsible"]}>
        <CollapsibleDemo />
      </Panel>
      <Panel n="39" title="Carousel" uses={["carousel"]} wide>
        <CarouselDemo />
      </Panel>
      <Panel n="40" title="Resizable" uses={["resizable"]} wide>
        <ResizableDemo />
      </Panel>
      <Panel n="41" title="Scroll area" uses={["scroll-area"]}>
        <ScrollAreaDemo />
      </Panel>
      <Panel n="43" title="Separator" uses={["separator"]}>
        <SeparatorDemo />
      </Panel>
      <Panel n="44" title="Bar graph" uses={[]}>
        <BarGraphDemo />
      </Panel>
      <Panel n="45" title="Display" uses={[]} wide>
        <DisplayDemo />
      </Panel>
      <Panel n="51" title="Item list" uses={["listbox"]} wide>
        <ItemListDemo />
      </Panel>
      <Panel n="52" title="D-pad" uses={["button"]} wide>
        <DPadDemo />
      </Panel>
      <Panel n="53" title="Mode dial" uses={["radio", "field"]} wide>
        <ModeDialDemo />
      </Panel>
      <Panel n="54" title="Button group" uses={["button", "core/bindRepeat"]} wide>
        <RockerDemo />
      </Panel>
      <Panel n="55" title="Navbar" uses={[]} wide>
        <NavbarDemo />
      </Panel>
      <Panel n="56" title="LCD" uses={[]} wide>
        <LCDDemo />
      </Panel>
      <Panel n="57" title="Slide switch" uses={["radio", "field"]} wide>
        <SlideSwitchDemo />
      </Panel>
      <Panel n="50" title="Code block" uses={["button"]} wide>
        <CodeBlockDemo />
      </Panel>
    </div>
  )
}

export { CatalogGrid }
