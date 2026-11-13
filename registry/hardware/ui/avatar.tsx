import { Avatar as SdkAvatar, AvatarFallback } from "@ui-sdk/react/avatar"

// An avatar is a small LED matrix behind a round lens. The lit pattern is
// worked out from the name and mirrored, so each person has their own glyph
// and it never changes. The name itself is there for screen readers.
const matrix = 7

function glyph(name: string) {
  let hash = 2166136261
  for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  const lit: boolean[] = []
  for (let row = 0; row < matrix; row++) {
    for (let col = 0; col < matrix; col++) {
      const half = col < 4 ? col : matrix - 1 - col
      const bit = (hash >>> ((row * 4 + half) % 31)) & 1
      const inside = Math.hypot(row - 3, col - 3) <= 3.2
      lit.push(inside && (bit === 1 || (row === 3 && half === 3)))
    }
  }
  return lit
}

function Avatar({ name, size }: { name: string; size?: "sm" | "lg" }) {
  const dots = glyph(name)
  return (
    <SdkAvatar data-kit="avatar" data-size={size}>
      <AvatarFallback data-kit="avatar-fallback">
        <span data-kit="avatar-matrix" aria-hidden>
          {dots.map((on, i) => {
            const row = Math.floor(i / matrix)
            const col = i % matrix
            if (Math.hypot(row - 3, col - 3) > 3.2) return <i key={i} data-off-lens />
            return <i key={i} data-on={on || undefined} />
          })}
        </span>
        <span data-kit="visually-hidden">{name}</span>
      </AvatarFallback>
    </SdkAvatar>
  )
}

export { Avatar }
