import { Breadcrumb } from "@/registry/hardware/ui/breadcrumb"

export default function BreadcrumbDemo() {
  return (
    <>
      <Breadcrumb items={["Acme", "Projects", "checkout-api"]} />
    </>
  )
}
