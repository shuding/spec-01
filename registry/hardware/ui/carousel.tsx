import { haptic } from "@/registry/hardware/lib/haptics"
import { Carousel as SdkCarousel, CarouselContent, CarouselIndicator, CarouselIndicatorGroup, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import { Icon } from "@/registry/hardware/ui/icon"

function Carousel({ slides }: { slides: string[] }) {
  return (
    <SdkCarousel data-kit="carousel" aria-label="Templates" onPageChange={() => haptic("selection")}>
      <CarouselPrevious
        data-kit="button"
        data-tone="secondary"
        data-shape="round"
        aria-label="Previous slide"
      >
        <Icon name="prev" />
      </CarouselPrevious>
      <CarouselViewport data-kit="carousel-viewport">
        <CarouselContent data-kit="carousel-content">
          {slides.map((slide) => (
            <CarouselItem key={slide} data-kit="carousel-item">
              <div data-kit="tile">{slide}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <CarouselNext data-kit="button" data-tone="secondary" data-shape="round" aria-label="Next slide">
        <Icon name="next" />
      </CarouselNext>
      <CarouselIndicatorGroup data-kit="carousel-indicators" aria-label="Choose a template">
        {slides.map((slide, index) => (
          <CarouselIndicator key={slide} page={index + 1} aria-label={slide} data-kit="carousel-indicator" />
        ))}
      </CarouselIndicatorGroup>
    </SdkCarousel>
  )
}

export { Carousel }
