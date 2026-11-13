import { Accordion as SdkAccordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@ui-sdk/react/accordion"

function Accordion({ items }: { items: { value: string; label: string; body: string }[] }) {
  return (
    <SdkAccordion data-kit="accordion" defaultValue={[items[0].value]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} data-kit="accordion-item">
          <AccordionHeader data-kit="accordion-header">
            <AccordionTrigger data-kit="accordion-trigger">
              {item.label}
              <span data-kit="accordion-led" aria-hidden />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel data-kit="accordion-panel">
            <p>{item.body}</p>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </SdkAccordion>
  )
}

export { Accordion }
