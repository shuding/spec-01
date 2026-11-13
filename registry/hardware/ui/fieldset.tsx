import * as React from "react"

// A group of controls under a printed bracket: a thin rule with a tick at
// each end and the legend set into it. A real fieldset, so the legend names
// the group for screen readers.
function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset data-kit="fieldset">
      <legend data-kit="legend">{legend}</legend>
      <div data-kit="fieldset-body">{children}</div>
    </fieldset>
  )
}

export { Fieldset }
