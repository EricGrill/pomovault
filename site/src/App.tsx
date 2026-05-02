import { siteContent } from "./content";

export function App() {
  return (
    <main className="min-h-screen bg-terminal text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-cyan/20 bg-terminal/90 px-6 py-5 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between font-mono">
          <a className="text-xl font-bold text-zinc-100" href="/">
            <span className="text-cyan">&gt;</span> PomoVault
          </a>
          <div className="hidden gap-6 text-sm uppercase text-muted md:flex">
            {siteContent.nav.map((item) => (
              <a key={item} className="hover:text-cyan" href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
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

        <div className="border border-cyan/30 bg-card p-5 font-mono shadow-cyan">
          <p className="text-sm text-cyan">$ pomo start</p>
          <div className="mt-4 space-y-3">
            {siteContent.proofLines.map((line) => (
              <div key={line} className="border border-zinc-800 bg-terminal p-3 text-sm text-zinc-300">
                {line}
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="text-5xl font-bold text-cyan">25:00</div>
            <div className="mt-2 text-sm uppercase text-muted">Work · Session 1/4</div>
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
