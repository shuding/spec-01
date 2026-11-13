import * as React from "react"
import { Toast, ToastAction, ToastDescription, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/react/toast"

function ToastDemo({ trigger, title, description }: { trigger: string; title: string; description: string }) {
  const [toast] = React.useState(() => createToaster())
  React.useEffect(() => () => void toast.dismiss(), [toast])
  return (
    <>
      <button
        type="button"
        data-kit="button"
        data-tone="primary"
        onClick={() => toast(title, { description, action: { label: "Undo", onAction: () => {} } })}
      >
        {trigger}
      </button>
      <ToastRegion toaster={toast} data-kit="toast-region">
        {() => (
          <Toast data-kit="toast">
            <div data-kit="toast-text">
              <ToastTitle data-kit="toast-title" />
              <ToastDescription data-kit="toast-description" />
            </div>
            <ToastAction data-kit="button" data-tone="secondary" />
          </Toast>
        )}
      </ToastRegion>
    </>
  )
}

export { ToastDemo }
