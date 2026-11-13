import { Progress as SdkProgress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@ui-sdk/react/progress"

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <SdkProgress data-kit="meter" value={value}>
      <div data-kit="row">
        <ProgressLabel data-kit="label">{label}</ProgressLabel>
        <ProgressValue data-kit="value" />
      </div>
      <ProgressTrack data-kit="meter-track">
        <ProgressIndicator data-kit="meter-indicator" />
      </ProgressTrack>
    </SdkProgress>
  )
}

export { Progress }
