import { Combobox } from "@/registry/hardware/ui/combobox"

export default function ComboboxDemo() {
  return (
    <>
      <Combobox label="Framework" options={["Next.js", "Nuxt", "SvelteKit", "SolidStart", "Astro"]} />
    </>
  )
}
