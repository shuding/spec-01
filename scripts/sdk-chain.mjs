#!/usr/bin/env node
// Writes src/catalog/sdk-chain.ts: for each UI SDK module the kit imports, the
// core APIs behind it and the foundation behaviors those are built from.
// The catalog prints this chain under each panel's caption.
//
// Run by hand (not part of the build) and commit the output:
//   node scripts/sdk-chain.mjs
// Rerun after upgrading @ui-sdk/* or when the kit imports a new module.
//
// Only public API is named: a name appears only if apps can import it, from
// @ui-sdk/core or one of the subpaths in its package.json exports. Internal
// files (like foundation/focus/collection) never do.
//
// How the chain is read, from the installed packages:
//   @ui-sdk/react/<m>  ->  the core APIs its dist file imports from
//                          @ui-sdk/core/<sub> (following its local imports)
//   @ui-sdk/core/<sub> ->  the public names the core files import from
//                          foundation modules,
//                          minus foundation/kernel (stores, primitives, and
//                          other plumbing every part uses), and skipping
//                          core/renderer and core/overlays, which every
//                          React part imports to render
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { dirname, join, resolve, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sdk = join(root, "node_modules/@ui-sdk")
const coreRoot = join(sdk, "core")
const coreExports = JSON.parse(readFileSync(join(coreRoot, "package.json"), "utf8")).exports
const read = (file) => readFileSync(file, "utf8")

// The modules the kit imports, and the names it imports from core directly.
const kitDirs = ["registry/hardware/ui", "registry/hardware/lib"].map((d) => join(root, d))
const kitFiles = kitDirs.flatMap((dir) => readdirSync(dir).filter((f) => /\.tsx?$/.test(f)).map((f) => join(dir, f)))
const used = new Map() // key -> Set of directly imported core names (core keys only)
const rootNames = new Set() // names imported from @ui-sdk/core itself
for (const file of kitFiles) {
  for (const m of read(file).matchAll(/^import\s*\{([^}]*)\}\s*from\s*"@ui-sdk\/core"/gm))
    for (const name of m[1].split(",")) { const n = name.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, ""); if (n) rootNames.add(n) }
  for (const m of read(file).matchAll(/^import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*"@ui-sdk\/(react|core)\/([a-z-]+)"/gm)) {
    const key = `${m[2]}/${m[3]}`
    if (!used.has(key)) used.set(key, new Set())
    if (m[2] === "core") for (const name of m[1].split(",")) { const n = name.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, ""); if (n) used.get(key).add(n) }
  }
}

// The foundation module that defines `name`, for an entry that imports and
// re-exports it (the core index, or a foundation subpath like core/date).
function definingModule(entry, name) {
  for (const m of read(entry).matchAll(/import\s*\{([^}]*)\}\s*from\s*"(\.[^"]+)"/g)) {
    if (!m[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0]).includes(name)) continue
    const rel = relative(join(coreRoot, "dist/foundation"), resolve(dirname(entry), m[2]))
    return rel.startsWith("..") ? null : rel.replace(/\.js$/, "")
  }
  return null
}

// Every value core exports publicly: what each export path's declarations
// export, following `export *` chains. Types aren't behaviors and are left out.
// Each name maps to where it's imported from: "core" for the package root,
// or "core/<subpath>"; a name exported from both is listed by its subpath.
function publicNames() {
  const names = new Map()
  const add = (name, from) => {
    const prev = names.get(name)
    if (!prev || prev === "core") names.set(name, from)
  }
  let seen
  const walk = (dts, from) => {
    if (seen.has(dts) || !existsSync(dts)) return
    seen.add(dts)
    const src = read(dts)
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g))
      for (const part of m[1].split(",")) {
        const item = part.trim()
        if (!item || item.startsWith("type ")) continue
        add(item.split(/\s+as\s+/).pop().trim(), from)
      }
    for (const m of src.matchAll(/export\s+declare\s+(?:function|const|let|class)\s+(\w+)/g)) add(m[1], from)
    for (const m of src.matchAll(/export\s*\*\s*from\s*"([^"]+)"/g)) walk(resolve(dirname(dts), m[1].replace(/\.js$/, ".d.ts")), from)
  }
  for (const [path, spec] of Object.entries(coreExports)) {
    const types = typeof spec === "string" ? null : spec.types
    if (!types || path === "./package.json") continue
    seen = new Set()
    walk(join(coreRoot, types), path === "." ? "core" : `core/${path.slice(2)}`)
  }
  return names
}
const publicFrom = publicNames()

// A core subpath's entry file.
function coreEntry(sub) {
  const spec = coreExports[`./${sub}`]
  if (!spec) return null
  const target = typeof spec === "string" ? spec : spec.default ?? spec.import
  return join(coreRoot, target)
}

// Public foundation names a core entry uses: follow relative imports to the
// component's own files (named after its entry, like dialog-parts.js for
// dialog.js; a folder can hold sibling components, as dialog/ holds
// alert-dialog), and record each name they import from a foundation file
// that core also exports publicly, as "<import path>|<name>".
function foundationOf(entry) {
  const found = new Set()
  const home = dirname(entry)
  const base = entry.split("/").pop().replace(/\.js$/, "")
  const own = (target) => dirname(target) === home && new RegExp(`^${base}(-|\\.js$)`).test(target.split("/").pop())
  const seen = new Set()
  const walk = (file) => {
    if (seen.has(file) || !existsSync(file)) return
    seen.add(file)
    const src = read(file)
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"(\.{1,2}\/[^"]+)"/g)) {
      const rel = relative(join(coreRoot, "dist/foundation"), resolve(dirname(file), m[2]))
      if (rel.startsWith("..")) continue
      if (rel.startsWith("kernel/")) continue
      for (const part of m[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/)[0]
        if (name && publicFrom.has(name)) found.add(`${publicFrom.get(name)}|${name}`)
      }
    }
    for (const m of src.matchAll(/from\s*"(\.{1,2}\/[^"]+)"/g)) {
      const target = resolve(dirname(file), m[1])
      if (own(target)) walk(target)
    }
  }
  walk(entry)
  return [...found].sort()
}

// The core APIs a React module uses: names it imports from @ui-sdk/core/*,
// following its imports of local helper files in react/dist.
function reactChain(mod) {
  const file = join(sdk, "react/dist", `${mod}.js`)
  const core = new Map() // sub -> Set(names)
  const seen = new Set()
  const walk = (f) => {
    if (seen.has(f) || !existsSync(f)) return
    seen.add(f)
    const src = read(f)
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"@ui-sdk\/core\/([a-z-]+)"/g)) {
      if (!core.has(m[2])) core.set(m[2], new Set())
      for (const n of m[1].split(",")) { const name = n.trim().split(/\s+as\s+/)[0]; if (name) core.get(m[2]).add(name) }
    }
    for (const m of src.matchAll(/from\s*"\.\/([^"]+)"/g)) {
      const local = join(dirname(f), m[1])
      // Shared React plumbing isn't part of a behavior's chain.
      if (/use-primitive|field-context|compose|slot|context\.js$/.test(m[1])) continue
      walk(local)
    }
  }
  walk(file)
  return core
}

const chain = {}
for (const [key, direct] of [...used].sort()) {
  const [pkg, mod] = key.split("/")
  const core = pkg === "react" ? reactChain(mod) : new Map([[mod, direct]])
  const apis = [], foundation = new Set()
  for (const [sub, names] of core) {
    // Rendering plumbing every part shares, not part of a behavior: the
    // renderer (how React drives a primitive; portalTarget, where popups
    // render) and the page-level overlays helper.
    if (sub === "renderer" || sub === "overlays") continue
    apis.push(...[...names].filter((n) => /^[a-z]/.test(n)))
    const entry = coreEntry(sub)
    const rel = entry ? relative(join(coreRoot, "dist/foundation"), entry) : ".."
    // A foundation subpath (like core/date) is itself the public API: its
    // names are the core line, with nothing further underneath to name.
    if (entry && rel.startsWith("..")) foundationOf(entry).forEach((f) => foundation.add(f))
  }
  chain[key] = { core: [...new Set(apis)].sort(), foundation: [...foundation].sort() }
}

// Names imported from the core index each get their own entry, keyed
// core/<name>: the public API itself.
for (const name of [...rootNames].sort()) chain[`core/${name}`] = { core: [name], foundation: [] }

const version = JSON.parse(read(join(coreRoot, "package.json"))).version
writeFileSync(
  join(root, "src/catalog/sdk-chain.ts"),
  `// Written by scripts/sdk-chain.mjs from @ui-sdk/core ${version}; rerun it\n` +
    `// rather than editing. For each module: its core APIs and the foundation\n` +
    `// behaviors they're built from.\n` +
    `const sdkVersion = ${JSON.stringify(version)}\n\n` +
    `const sdkChain: Record<string, { core: string[]; foundation: string[] }> = ${JSON.stringify(chain, null, 2)}\n\n` +
    `export { sdkChain, sdkVersion }\n`,
)
for (const [key, v] of Object.entries(chain)) console.log(`${key.padEnd(26)} core: ${v.core.join(", ") || "-"}\n${" ".repeat(26)} foundation: ${v.foundation.join(", ") || "-"}`)
