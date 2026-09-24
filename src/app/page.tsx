import Link from "next/link";
import BackwardCounter from "@/components/counters/backward-counter";
import ForwardCounter from "@/components/counters/forward-counter";

export default function Home() {
  return (
    <main className="shell">
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
            Small hooks. Endless possibilities. Explore two counters powered by
            the same logic, each moving at its own pace.
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
          <h2 id="playground-title">Make it tick<span>.</span></h2>
          <span className="live-label"><i aria-hidden="true" /> Live playground</span>
        </div>
        <div className="counter-grid">
          <ForwardCounter />
          <BackwardCounter />
        </div>
        <p className="playground-note">
          <span className="note-icon" aria-hidden="true">↳</span>
          <span><strong>Try this:</strong> pause one counter, speed up the other. Reset returns a counter to zero at its default speed.</span>
        </p>
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
          <span className="code-keyword">const</span>{" count = useCounter(true, {\n  running: true,\n  intervalMs: 1000,\n});"}
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
