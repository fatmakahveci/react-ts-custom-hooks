import Link from "next/link";
import BackwardCounter from "@/components/counters/backward-counter";
import ForwardCounter from "@/components/counters/forward-counter";

export default function Home() {
  return (
    <main className="shell">
      <a className="skip-link" href="#playground-title">Skip to counters</a>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Hook Lab home">
          <span aria-hidden="true">↔</span> Hook Lab
          <span className="brand-dot">.</span>
        </Link>
        <a className="source-link" href="https://github.com/fatmakahveci/react-ts-custom-hooks">
          View source <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div className="intro-content">
          <p className="eyebrow"><span className="experiment-number">01</span> THE CUSTOM HOOKS PLAYGROUND</p>
          <h1 id="page-title">Shared logic.<br /><span>Independent state.</span></h1>
          <p className="intro-copy">
            Change the pace. Try a bigger step. Inspect the code. Two independent
            counters make reusable React logic something you can actually explore.
          </p>
          <div className="intro-tags"><span>React</span><span>TypeScript</span><span>Built to experiment</span></div>
        </div>
        <aside className="hook-diagram" aria-label="One useCounter hook powers two instances with independent state">
          <div className="diagram-heading"><span className="diagram-dot" /> THE IDEA</div>
          <div className="diagram-source"><span aria-hidden="true">&#123; &#125;</span><code>useCounter()</code><small>One reusable hook</small></div>
          <div className="diagram-branches" aria-hidden="true"><span /><span /></div>
          <div className="diagram-instances">
            <div><span aria-hidden="true">↗</span><strong>Forward</strong><small>Own state</small></div>
            <div><span aria-hidden="true">↘</span><strong>Backward</strong><small>Own state</small></div>
          </div>
          <p>Same blueprint. Separate journeys.</p>
        </aside>
      </section>

      <section aria-labelledby="playground-title">
        <div className="section-heading">
          <h2 id="playground-title" tabIndex={-1}>Make it tick<span>.</span></h2>
          <span className="live-label"><i aria-hidden="true" /> Live playground</span>
        </div>
        <div className="counter-grid">
          <ForwardCounter />
          <BackwardCounter />
        </div>
        <p className="playground-note">
          <span className="note-icon" aria-hidden="true">↳</span>
          <span><strong>Try this:</strong> choose Sprint on one counter, then pause the other and advance it manually. Open Live code to see your settings as React code.</span>
        </p>
      </section>

      <section className="experiment-guide" aria-labelledby="experiments-title">
        <div className="section-heading">
          <h2 id="experiments-title">Three small experiments<span>.</span></h2>
          <span className="guide-caption">Learn by changing one thing</span>
        </div>
        <div className="experiment-grid">
          <article><span className="experiment-index">01 / ISOLATE</span><h3>Let one take a break.</h3><p>Pause the forward counter. The backward counter keeps moving because each hook call owns its state.</p></article>
          <article><span className="experiment-index">02 / CONFIGURE</span><h3>Find a different rhythm.</h3><p>Try Sprint: five steps every half-second. Changing the settings keeps your count and starts a fresh interval.</p></article>
          <article><span className="experiment-index">03 / INSPECT</span><h3>Make every step visible.</h3><p>Pause, change the step size, and press Step. Open Live code to inspect the configuration or copy it into your component.</p></article>
        </div>
      </section>

      <section className="under-the-hood" aria-labelledby="hook-title">
        <div>
          <p className="eyebrow">UNDER THE HOOD</p>
          <h2 id="hook-title">Write it once.<br />Use it independently.</h2>
          <p>
            Each call owns its state. An effect manages the interval and clears
            it when paused, reconfigured, or unmounted.
          </p>
        </div>
        <div className="code-panel">
          <div className="code-heading"><span>use-counter.ts</span><span>TypeScript</span></div>
          <pre aria-label="Counter hook usage"><code>
          <span className="code-comment">{"// Same hook, different directions"}</span>{"\n"}
          <span className="code-keyword">const</span>{" forward = useCounter();\n"}
          <span className="code-keyword">const</span>{" backward = useCounter(false);\n\n"}
          <span className="code-comment">{"// Control timing without changing the UI"}</span>{"\n"}
          <span className="code-keyword">const</span>{" count = useCounter(true, {\n  running: true,\n  intervalMs: 1000,\n  step: 1,\n});"}
        </code></pre>
        </div>
      </section>

      <footer>
        <span>Small hooks. Clear thinking.</span>
        <span>Built with React & TypeScript · Apache 2.0</span>
      </footer>
    </main>
  );
}
