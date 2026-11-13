import { Avatar } from "@/registry/hardware/ui/avatar"

function Feed({ items }: { items: { who: string; what: string; when: string }[] }) {
  return (
    <ol data-kit="feed">
      {items.map((item) => (
        <li key={item.what} data-kit="feed-item">
          <Avatar name={item.who} size="sm" />
          <p>
            <strong>{item.who}</strong> {item.what}
          </p>
          <time data-kit="muted">{item.when}</time>
        </li>
      ))}
    </ol>
  )
}

export { Feed }
