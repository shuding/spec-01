// Written by scripts/sdk-chain.mjs from @ui-sdk/core 0.0.0-20261111125312.ga16c1d57; rerun it
// rather than editing. For each module: its core APIs and the foundation
// behaviors they're built from.
const sdkVersion = "0.0.0-20261111125312.ga16c1d57"

const sdkChain: Record<string, { core: string[]; foundation: string[] }> = {
  "core/date": {
    "core": [
      "dateParts",
      "daysInMonth",
      "isoDate",
      "weekday"
    ],
    "foundation": []
  },
  "react/accordion": {
    "core": [
      "accordion",
      "createAccordionController"
    ],
    "foundation": [
      "core|bindPanel",
      "core|hiddenAttrs",
      "core|openAttrs"
    ]
  },
  "react/alert-dialog": {
    "core": [
      "alertDialog",
      "confirm",
      "createAlertDialogController",
      "createConfirm"
    ],
    "foundation": []
  },
  "react/avatar": {
    "core": [
      "avatar"
    ],
    "foundation": []
  },
  "react/button": {
    "core": [
      "button"
    ],
    "foundation": []
  },
  "react/carousel": {
    "core": [
      "carousel",
      "createCarouselController"
    ],
    "foundation": [
      "core/drawer|sheetPhysics",
      "core/gesture|createVelocityTracker",
      "core/gesture|projectDistance",
      "core/gesture|solveSpring",
      "core/number|clamp",
      "core|createRovingFocus",
      "core|isRTL"
    ]
  },
  "react/checkbox": {
    "core": [
      "checkbox",
      "checkboxGroup",
      "createCheckboxController",
      "createCheckboxGroupController"
    ],
    "foundation": [
      "core|animateIn",
      "core|animateOut"
    ]
  },
  "react/collapsible": {
    "core": [
      "collapsible",
      "createCollapsibleController"
    ],
    "foundation": [
      "core|bindPanel",
      "core|hiddenAttrs",
      "core|openAttrs"
    ]
  },
  "react/combobox": {
    "core": [
      "combobox",
      "createComboboxController"
    ],
    "foundation": [
      "core/renderer|flattenData",
      "core/renderer|isApple",
      "core/renderer|itemKey",
      "core|announce",
      "core|createPopup",
      "core|isRTL"
    ]
  },
  "react/command": {
    "core": [
      "command",
      "createCommandController"
    ],
    "foundation": [
      "core/renderer|initialApple",
      "core/shortcuts|ariaKeyshortcuts",
      "core/shortcuts|formatShortcut",
      "core/shortcuts|shortcuts"
    ]
  },
  "react/date-picker": {
    "core": [
      "calendar",
      "createCalendarController",
      "createDatePickerController",
      "datePicker"
    ],
    "foundation": [
      "core/date|addDays",
      "core/date|addMonths",
      "core/date|addYears",
      "core/date|clampDate",
      "core/date|dateFormatter",
      "core/date|datePattern",
      "core/date|daysBetween",
      "core/date|endOfWeek",
      "core/date|firstDayOfWeek",
      "core/date|formatDate",
      "core/date|formatDateRange",
      "core/date|isISODate",
      "core/date|monthGrid",
      "core/date|monthNames",
      "core/date|parseDate",
      "core/date|startOfWeek",
      "core/date|todayDate",
      "core/date|weekday",
      "core/date|weekdayNames",
      "core/renderer|initialApple",
      "core|createFocusRecovery",
      "core|createPopup",
      "core|createRovingFocus",
      "core|popupState"
    ]
  },
  "react/dialog": {
    "core": [
      "createDialogController",
      "dialog"
    ],
    "foundation": [
      "core/dialog|dialogPreset",
      "core/renderer|initialApple",
      "core/shortcuts|ariaKeyshortcuts",
      "core|createPopup",
      "core|popupDescription",
      "core|popupTitle",
      "core|popupTrigger",
      "core|popupViewport"
    ]
  },
  "react/drawer": {
    "core": [
      "createDrawerController",
      "drawer",
      "sheetPhysics"
    ],
    "foundation": [
      "core/drawer|sheetPhysics",
      "core/renderer|initialApple"
    ]
  },
  "react/field": {
    "core": [
      "field",
      "fieldGroup",
      "fieldSet"
    ],
    "foundation": [
      "core/renderer|fieldControlId"
    ]
  },
  "react/hover-card": {
    "core": [
      "createHoverCardController",
      "hoverCard"
    ],
    "foundation": [
      "core/hover-card|hoverCardPreset",
      "core|createPopup",
      "core|popupArrow",
      "core|popupContent",
      "core|popupState",
      "core|popupTrigger"
    ]
  },
  "react/input": {
    "core": [
      "createInputController",
      "input",
      "inputGroup"
    ],
    "foundation": [
      "core/renderer|isApple"
    ]
  },
  "react/listbox": {
    "core": [
      "createListboxController",
      "listbox"
    ],
    "foundation": [
      "core/renderer|itemKey",
      "core|isRTL",
      "core|isTypeaheadKey"
    ]
  },
  "react/menu": {
    "core": [
      "createMenuController",
      "menu"
    ],
    "foundation": [
      "core/renderer|initialApple",
      "core/shortcuts|ariaKeyshortcuts",
      "core/shortcuts|shortcuts",
      "core|animateIn",
      "core|bindHold",
      "core|createPopup",
      "core|createTypeahead",
      "core|isRTL",
      "core|labelOf"
    ]
  },
  "react/menubar": {
    "core": [
      "createMenubarController",
      "menubar"
    ],
    "foundation": [
      "core|createRovingFocus",
      "core|createTypeahead",
      "core|isRTL",
      "core|isTypeaheadKey",
      "core|labelOf"
    ]
  },
  "react/meter": {
    "core": [
      "meter"
    ],
    "foundation": []
  },
  "react/number-input": {
    "core": [
      "createNumberInputController",
      "numberInput"
    ],
    "foundation": [
      "core/number|clamp",
      "core/number|decimalsOf",
      "core/number|formatNumber",
      "core/number|isPartialNumber",
      "core/number|maxOnGrid",
      "core/number|numberFormatter",
      "core/number|parseNumber",
      "core/number|stepFromKey",
      "core/number|stepValue"
    ]
  },
  "react/otp-input": {
    "core": [
      "createOTPInputController",
      "otpInput"
    ],
    "foundation": [
      "core|isRTL"
    ]
  },
  "react/pagination": {
    "core": [
      "createPaginationController",
      "pagination",
      "paginationRange"
    ],
    "foundation": []
  },
  "react/popover": {
    "core": [
      "createPopoverController",
      "popover"
    ],
    "foundation": [
      "core/popover|popoverPreset",
      "core/renderer|initialApple",
      "core/shortcuts|ariaKeyshortcuts",
      "core|createPopup",
      "core|popupArrow",
      "core|popupClose",
      "core|popupContent",
      "core|popupDescription",
      "core|popupState",
      "core|popupTitle",
      "core|popupTrigger",
      "core|popupViewport"
    ]
  },
  "react/progress": {
    "core": [
      "progress"
    ],
    "foundation": []
  },
  "react/radio": {
    "core": [
      "createRadioGroupController",
      "radioGroup"
    ],
    "foundation": [
      "core|animateIn",
      "core|animateOut",
      "core|createRovingFocus"
    ]
  },
  "react/resizable": {
    "core": [
      "createResizableController",
      "resizable",
      "resizableStorageKey"
    ],
    "foundation": [
      "core/number|clamp",
      "core/renderer|writeStyle",
      "core|bindDrag",
      "core|isRTL"
    ]
  },
  "react/scroll-area": {
    "core": [
      "createScrollAreaController",
      "scrollArea"
    ],
    "foundation": [
      "core|isRTL"
    ]
  },
  "react/segmented-control": {
    "core": [
      "createSegmentedControlController",
      "segmentedControl"
    ],
    "foundation": []
  },
  "react/separator": {
    "core": [
      "separator"
    ],
    "foundation": []
  },
  "react/slider": {
    "core": [
      "createSliderController",
      "slider"
    ],
    "foundation": [
      "core/number|clamp",
      "core/number|formatNumber",
      "core/number|maxOnGrid",
      "core/number|stepFromKey",
      "core/renderer|parseRange",
      "core|isRTL"
    ]
  },
  "react/switch": {
    "core": [
      "createSwitchController",
      "switchPrimitive"
    ],
    "foundation": []
  },
  "react/tabs": {
    "core": [
      "createTabsController",
      "tabs"
    ],
    "foundation": [
      "core|animateIn",
      "core|animateOut",
      "core|bindFindable",
      "core|createRovingFocus",
      "core|hiddenAttrs"
    ]
  },
  "react/textarea": {
    "core": [
      "createInputController",
      "textarea"
    ],
    "foundation": [
      "core/renderer|isApple"
    ]
  },
  "react/toast": {
    "core": [
      "createToaster",
      "toast",
      "toastRegion"
    ],
    "foundation": [
      "core/renderer|writeStyle",
      "core/shortcuts|ariaKeyshortcuts",
      "core/shortcuts|registerShortcut",
      "core|animateIn",
      "core|animateOut",
      "core|announce",
      "core|bindPersistentLayer",
      "core|isRTL",
      "core|prepareAnnouncements",
      "core|supportsTopLayer"
    ]
  },
  "react/toggle": {
    "core": [
      "createToggleController",
      "createToggleGroupController",
      "toggle",
      "toggleGroup"
    ],
    "foundation": [
      "core|createRovingFocus"
    ]
  },
  "react/toolbar": {
    "core": [
      "createToolbarController",
      "toolbar"
    ],
    "foundation": [
      "core|createRovingFocus",
      "core|isRTL"
    ]
  },
  "react/tooltip": {
    "core": [
      "createTooltipController",
      "tooltip"
    ],
    "foundation": [
      "core/renderer|initialApple",
      "core/shortcuts|ariaKeyshortcuts",
      "core/tooltip|tooltipPreset",
      "core|announce",
      "core|createPopup",
      "core|popupArrow",
      "core|popupContent",
      "core|popupState",
      "core|popupTrigger"
    ]
  },
  "core/bindRepeat": {
    "core": [
      "bindRepeat"
    ],
    "foundation": []
  }
}

export { sdkChain, sdkVersion }
