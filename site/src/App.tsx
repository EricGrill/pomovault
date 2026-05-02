import { siteContent } from "./content";

export function App() {
  return (
    <main className="min-h-screen bg-terminal text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-cyan/20 bg-terminal/90 px-6 py-5 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-col gap-4 font-mono md:flex-row md:items-center md:justify-between">
          <a className="text-xl font-bold text-zinc-100" href="/">
            <span className="text-cyan">&gt;</span> PomoVault
          </a>
          <div className="flex gap-4 overflow-x-auto whitespace-nowrap text-xs uppercase text-muted md:gap-6 md:text-sm">
            {siteContent.nav.map((item) => (
              <a key={item} className="hover:text-cyan" href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.92fr_1.08fr] md:py-20">
        <div>
          <p className="font-mono text-sm text-green">// focus_protocol</p>
          <h1 className="mt-4 font-mono text-5xl font-bold md:text-7xl">{siteContent.headline}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-zinc-300">{siteContent.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-4 font-mono text-sm uppercase">
            <a
              className="border-2 border-cyan px-5 py-3 text-cyan hover:bg-cyan hover:text-terminal"
              href="https://github.com/ericgrill/pomovault"
            >
              View GitHub
            </a>
            <a
              className="border border-magenta px-5 py-3 text-magenta hover:bg-magenta hover:text-terminal"
              href="#docs"
            >
              Install Notes
            </a>
          </div>
        </div>

        <figure>
          <ProductPanel featured />
          <figcaption className="mt-3 font-mono text-sm text-muted">{siteContent.proofSurfaces[0].caption}</figcaption>
        </figure>
      </section>

      <section className="border-y border-zinc-800 bg-panel px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm text-cyan">// proof_in_the_vault</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {siteContent.proofSurfaces.map((surface) => (
              <figure key={surface.title} className="border border-zinc-800 bg-card p-4">
                {surface.kind === "panel" ? (
                  <ProductPanel />
                ) : (
                  <VaultSnippet lines={surface.lines} tone={surface.kind} />
                )}
                <figcaption className="p-2">
                  <h2 className="font-mono text-lg text-zinc-100">{surface.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{surface.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-zinc-800 bg-panel px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm text-cyan">// execution_loop</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Choose the next task", "Run the Pomodoro", "Log proof of work"].map((item, index) => (
              <article key={item} className="border border-zinc-800 bg-card p-5">
                <p className="font-mono text-sm text-green">0{index + 1}</p>
                <h2 className="mt-3 font-mono text-xl">{item}</h2>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-sm text-magenta">// what_ships</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {siteContent.features.map((feature) => (
            <div key={feature} className="border border-zinc-800 bg-card p-5 text-zinc-300">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section id="docs" className="border-t border-zinc-800 bg-panel px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm text-green">// install_notes</p>
          <h2 className="mt-4 font-mono text-3xl">Built for the vault. Documented for humans.</h2>
          <p className="mt-4 max-w-3xl text-zinc-300">
            Setup docs cover installation, task syntax, timer commands, logging behavior, and release notes.
          </p>
        </div>
      </section>

      <footer id="github" className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 font-mono text-sm text-muted md:flex-row md:items-center md:justify-between">
          <span>$ echo "2026 PomoVault"</span>
          <a className="text-cyan hover:text-magenta" href="https://github.com/ericgrill/pomovault">
            GitHub →
          </a>
        </div>
      </footer>
    </main>
  );
}

function ProductPanel({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`border border-cyan/30 bg-card font-mono shadow-cyan ${featured ? "p-4 sm:p-5" : "p-3"}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-sm">
        <span className="text-cyan">PomoVault.md</span>
        <span className="text-muted">plain markdown</span>
      </div>
      <div className="mt-4 border border-cyan/30 bg-terminal p-4">
        <p className="text-xs uppercase text-muted">Work · Session 1/4</p>
        <div className={`${featured ? "text-6xl sm:text-7xl" : "text-5xl"} mt-3 font-bold leading-none text-cyan`}>
          25:00
        </div>
        <div className="mt-4 flex gap-2 text-xs uppercase">
          <span className="border border-zinc-700 px-3 py-2 text-zinc-200">Pause</span>
          <span className="border border-zinc-700 px-3 py-2 text-zinc-200">Reset</span>
        </div>
      </div>
      <div className="mt-3 border border-yellow-500/30 bg-yellow-950/20 p-4">
        <p className="text-xs uppercase text-yellow-300">Now working on</p>
        <p className="mt-2 text-base text-zinc-100">Draft launch post</p>
      </div>
      <div className="mt-3 border border-zinc-800 bg-terminal p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg text-zinc-100">Tasks</h3>
          <span className="border border-cyan px-2 py-1 text-xs text-cyan">+ Add Task</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3 text-sm">
          <span className="border border-zinc-700 px-2 py-1 text-zinc-200">Start</span>
          <span className="rounded-full border border-magenta px-2 py-1 text-xs text-magenta">HIGH</span>
          <span className="min-w-0 flex-1 basis-40 text-zinc-100">Draft launch post</span>
          <span className="text-muted">2026-05-04</span>
          <span className="border border-zinc-700 px-2 py-1 text-zinc-200">Done</span>
        </div>
      </div>
    </div>
  );
}

function VaultSnippet({ lines, tone }: { lines?: string[]; tone: string }) {
  return (
    <div className="min-h-80 border border-zinc-800 bg-terminal p-4 font-mono text-sm leading-7 text-zinc-200 sm:text-base">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3 text-xs uppercase">
        <span className={tone === "ledger" ? "text-green" : "text-cyan"}>{tone === "ledger" ? "session ledger" : "task source"}</span>
        <span className="text-muted">.md</span>
      </div>
      {(lines ?? []).map((line) => (
        <p key={line} className={line.startsWith("#") ? "text-green" : "break-words text-zinc-200"}>
          {line}
        </p>
      ))}
    </div>
  );
}
