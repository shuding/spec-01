import { PageWheel } from "@/registry/hardware/ui/page-wheel"

export default function PaginationDemo() {
  return (
    <>
      <PageWheel pageCount={24} defaultPage={3} />
    </>
  )
}
