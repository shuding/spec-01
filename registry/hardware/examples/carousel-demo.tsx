import { Carousel } from "@/registry/hardware/ui/carousel"

export default function CarouselDemo() {
  return (
    <>
      <Carousel slides={["Blog", "Store", "Docs", "Portfolio"]} />
    </>
  )
}
