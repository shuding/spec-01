import * as React from "react"
import { Button } from "@/registry/hardware/ui/button"
import { Icon } from "@/registry/hardware/ui/icon"
import { BarGraph } from "@/registry/hardware/ui/bar-graph"
import { Display } from "@/registry/hardware/ui/display"
import { ItemList } from "@/registry/hardware/ui/item-list"
import { DPad } from "@/registry/hardware/ui/dpad"
import { SlideSwitch } from "@/registry/hardware/ui/slide-switch"
import { notify } from "@/registry/hardware/ui/toaster"
import { Device } from "@/registry/hardware/ui/device"

type Deploy = { id: string; name: string; status: string; branch: string; author: string; age: string }

const deploys: Deploy[] = [
  { id: "d1", name: "checkout-api", status: "Ready", branch: "main", author: "Ada", age: "4m" },
  { id: "d2", name: "web", status: "Building", branch: "feat/search", author: "Grace", age: "9m" },
  { id: "d3", name: "billing-worker", status: "Error", branch: "fix/retries", author: "Alan", age: "32m" },
  { id: "d4", name: "docs", status: "Ready", branch: "main", author: "Katherine", age: "1h" },
  { id: "d5", name: "edge-config", status: "Queued", branch: "chore/deps", author: "Linus", age: "2h" },
]

const logs: Record<string, string[]> = {
  "checkout-api": ["clone main @ 4f2c9e1", "install 412 packages", "build api", "test 86 passed", "upload 3 regions", "ready in 42s"],
  web: ["clone feat/search @ 9a0be77", "install 1,204 packages", "build next", "prerender 312 pages", "optimize images 96/120"],
  "billing-worker": ["clone fix/retries @ c81d004", "build worker", "test 41 passed, 2 failed", "error: timeout after 30s", "build failed"],
  docs: ["clone main @ 77ad210", "build content", "index 1,840 pages", "ready in 1m 08s"],
  "edge-config": ["queued behind 2 builds", "waiting for a runner…"],
}

const environments = {
  Prod: { rps: 1284, errors: 0.21, p95: 182, traffic: [0.32, 0.4, 0.62, 0.78, 0.84, 0.71, 0.66, 0.74, 0.58, 0.44, 0.5, 0.61] },
  Preview: { rps: 96, errors: 1.4, p95: 240, traffic: [0.12, 0.2, 0.18, 0.3, 0.22, 0.35, 0.28, 0.4, 0.33, 0.26, 0.3, 0.24] },
  Dev: { rps: 12, errors: 3.8, p95: 410, traffic: [0.05, 0.08, 0.1, 0.06, 0.12, 0.09, 0.14, 0.1, 0.07, 0.11, 0.08, 0.13] },
}
type Env = keyof typeof environments

const pages = ["Overview", "Deploys", "Logs"] as const

// A service console as a handheld: the D-pad moves between pages (left and
// right) and deployments (up and down), the screen shows the page, A
// redeploys the chosen deployment and B returns to the overview. The
// environment switch changes what everything reads from. B sits low on the
// left and A high on the right, as on a handheld.
function Dashboard() {
  const [page, setPage] = React.useState(0)
  const [env, setEnv] = React.useState<Env>("Prod")
  const [chosen, setChosen] = React.useState(deploys[0].id)
  const deploy = deploys.find((d) => d.id === chosen)!
  const data = environments[env]
  const at = deploys.indexOf(deploy)

  const pad = (dir: "up" | "down" | "left" | "right") => {
    if (dir === "left") setPage((p) => (p + pages.length - 1) % pages.length)
    if (dir === "right") setPage((p) => (p + 1) % pages.length)
    if (dir === "up") setChosen(deploys[(at + deploys.length - 1) % deploys.length].id)
    if (dir === "down") setChosen(deploys[(at + 1) % deploys.length].id)
  }

  return (
    <Device model="DX-1" name="Dashboard" on>
      <div data-dash>
        <div data-dash-pad>
          <DPad
            label="Navigate"
            onUp={() => pad("up")}
            onDown={() => pad("down")}
            onLeft={() => pad("left")}
            onRight={() => pad("right")}
          />
          <small aria-hidden>Nav</small>
        </div>

        <div data-dash-screen>
          <Display aspect="16 / 10">
            <div data-dash-view aria-live="polite">
              <nav data-dash-pages aria-label="Pages">
                {pages.map((name, i) => (
                  <button key={name} type="button" aria-current={i === page || undefined} onClick={() => setPage(i)}>
                    {name}
                  </button>
                ))}
                <span>{env}</span>
              </nav>
              {page === 0 && (
                <div data-dash-overview>
                  <dl>
                    <div>
                      <dt>Req/s</dt>
                      <dd>{data.rps.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Errors</dt>
                      <dd>{data.errors}%</dd>
                    </div>
                    <div>
                      <dt>P95</dt>
                      <dd>{data.p95}ms</dd>
                    </div>
                  </dl>
                  <BarGraph label="Traffic, last 24 hours" values={data.traffic} />
                </div>
              )}
              {page === 1 && (
                <div data-dash-detail>
                  <span data-status={deploy.status}>{deploy.status}</span>
                  <strong>{deploy.name}</strong>
                  <dl>
                    <div>
                      <dt>Branch</dt>
                      <dd>{deploy.branch}</dd>
                    </div>
                    <div>
                      <dt>Author</dt>
                      <dd>{deploy.author}</dd>
                    </div>
                    <div>
                      <dt>Age</dt>
                      <dd>{deploy.age}</dd>
                    </div>
                  </dl>
                </div>
              )}
              {page === 2 && (
                <ol data-dash-log>
                  {logs[deploy.name].map((line, i) => (
                    <li key={i} data-error={/error|failed/.test(line) || undefined}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {line}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Display>
        </div>

        <div data-dash-right>
          <SlideSwitch label="Environment" orientation="vertical" options={["Prod", "Preview", "Dev"]} value={env} onValueChange={(v) => setEnv(v as Env)} />
          <div data-dash-ab>
            <div>
              <Button round aria-label="Back to overview" onClick={() => setPage(0)}>
                <Icon name="undo" />
              </Button>
              <small aria-hidden>Back</small>
            </div>
            <div>
              <Button round tone="primary" aria-label={`Redeploy ${deploy.name}`} onClick={() => notify(`Redeploying ${deploy.name}`, { description: `${deploy.branch} → ${env}`, duration: 2000 })}>
                <Icon name="rocket" />
              </Button>
              <small aria-hidden>Deploy</small>
            </div>
          </div>
        </div>
      </div>

      <ItemList
        label="Deployments"
        rows={deploys}
        rowKey={(d) => d.id}
        value={chosen}
        onValueChange={setChosen}
        columns={[
          { key: "name", label: "Project", width: "minmax(0, 1.3fr)", render: (d) => d.name },
          { key: "branch", label: "Branch", width: "minmax(0, 1fr)", render: (d) => d.branch },
          { key: "status", label: "Status", width: "64px", render: (d) => d.status },
          { key: "age", label: "Age", width: "32px", align: "end", render: (d) => d.age },
        ]}
      />
    </Device>
  )
}

export { Dashboard }
