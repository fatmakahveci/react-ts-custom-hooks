"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import useWorkspace from "@/hooks/use-workspace";
import useDebounce from "@/hooks/use-debounce";
import useLocalStorage from "@/hooks/use-local-storage";
import { formatClock, sameDay, settleTimer, timeLeft, type Task } from "@/lib/workspace";
import "./focus-desk.css";
const isDuration = (v: unknown): v is number => [15, 25, 50].includes(v as number);
export default function FocusDesk() {
  const { data, saving, error, save, retry } = useWorkspace();
  const {
    value: duration,
    setValue: setDuration,
    error: preferenceError,
  } = useLocalStorage("focus-desk:duration", 25, isDuration);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normal");
  const [search, setSearch] = useState("");
  const query = useDebounce(search, 200);
  const [filter, setFilter] = useState("active");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [deleting, setDeleting] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = data?.timer ?? null;
  const remaining = timer ? timeLeft(timer, now) : duration * 60000;
  const task = data?.tasks.find((t) => t.id === selected && !t.done) ?? null;
  const disabled = !data || saving;
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (timer?.endsAt !== null && timer && remaining === 0 && !saving && !error) {
      void save((current) => settleTimer(current, Date.now())).then((ok) => {
        if (ok)
          setNotice(
            timer.mode === "focus"
              ? "Focus session complete. Take a break, or choose your next task."
              : "Break complete. Ready when you are.",
          );
      });
    }
  }, [timer, remaining, saving, error, save]);
  useEffect(() => {
    const original = "Focus Desk | One task. Your full attention.";
    document.title = timer
      ? `${formatClock(remaining)} · ${timer.mode === "focus" ? "Focus" : "Break"} — Focus Desk`
      : original;
    return () => {
      document.title = original;
    };
  }, [remaining, timer]);
  const tasks = data?.tasks ?? [];
  const filtered = tasks
    .filter(
      (t) =>
        (filter === "all" || (filter === "done" ? t.done : !t.done)) &&
        t.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.priority === "high") - Number(a.priority === "high") || b.createdAt - a.createdAt,
    );
  const today = data?.sessions.filter((s) => sameDay(s.completedAt, now)) ?? [];
  async function addTask(event: FormEvent) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: clean,
      priority,
      done: false,
      createdAt: Date.now(),
    };
    if (await save((current) => ({ ...current, tasks: [...current.tasks, newTask] }))) {
      setTitle("");
      setSelected(newTask.id);
      setFilter("active");
      setSearch("");
      setNotice("Task added. Ready for a little focused work.");
      input.current?.focus();
    }
  }
  async function start(mode: "focus" | "break") {
    if (mode === "focus" && !task) return;
    const length = (mode === "break" ? 5 : duration) * 60000;
    const next = {
      id: crypto.randomUUID(),
      mode,
      taskId: mode === "focus" ? task!.id : null,
      taskTitle: mode === "focus" ? task!.title : "Short break",
      durationMs: length,
      remainingMs: length,
      endsAt: Date.now() + length,
    };
    if (await save((current) => (current.timer ? current : { ...current, timer: next })))
      setNotice(
        mode === "focus"
          ? "Focus started. One thing at a time."
          : "Take five minutes for yourself.",
      );
  }
  async function toggleTimer() {
    await save((current) => {
      const settled = settleTimer(current, Date.now());
      if (!settled.timer) return settled;
      const t = settled.timer;
      return {
        ...settled,
        timer: {
          ...t,
          remainingMs: timeLeft(t, Date.now()),
          endsAt: t.endsAt === null ? Date.now() + t.remainingMs : null,
        },
      };
    });
  }
  function exportData() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "focus-desk-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your tasks and session history have been exported.");
  }
  return (
    <main className="desk-shell">
      <a className="skip-link" href="#tasks-title">
        Skip to tasks
      </a>
      <header className="desk-header">
        <Link className="brand" href="/" aria-label="Focus Desk home">
          <span aria-hidden="true">◷</span>Focus Desk<span className="brand-dot">.</span>
        </Link>
      </header>
      <div className="desk-heading">
        <div>
          <p className="eyebrow">LESS SWITCHING. MORE FINISHING.</p>
          <h1>Make room for good work.</h1>
          <p>Choose one task. Give it your attention. See what you finish.</p>
        </div>
        <span className="save-state" role="status">
          {saving
            ? "Saving…"
            : error
              ? "Connection needs attention"
              : data
                ? "✓ Workspace saved"
                : "Opening your workspace…"}
        </span>
      </div>
      {error && (
        <div className="desk-error" role="alert">
          <span>{error} Your last saved work is kept.</span>
          <button onClick={() => void retry()} disabled={saving}>
            Retry connection
          </button>
        </div>
      )}
      <div className="desk-grid">
        <section className="desk-panel task-panel" aria-labelledby="tasks-title">
          <div className="panel-heading">
            <h2 id="tasks-title" tabIndex={-1}>
              Your tasks
            </h2>
            <span>{tasks.filter((t) => !t.done).length} open</span>
          </div>
          <form className="task-form" onSubmit={addTask}>
            <label htmlFor="task-title">What needs your attention?</label>
            <div className="task-input-row">
              <input
                ref={input}
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={180}
                required
                placeholder="e.g. Outline the project proposal"
                disabled={!data}
              />
              <button
                className="desk-primary"
                disabled={disabled || !title.trim() || tasks.length >= 1000}
              >
                Add task
              </button>
            </div>
            <div className="priority-field">
              <label htmlFor="new-priority">Priority</label>
              <select
                id="new-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
              <span>Small, specific tasks work best.</span>
            </div>
          </form>
          <div className="task-tools">
            <div className="task-filters" aria-label="Task filters">
              {[
                ["active", "To do"],
                ["done", "Done"],
                ["all", "All"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="search-field">
              <span className="sr-only">Search tasks</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
              />
            </label>
          </div>
          {!data ? (
            <div className="desk-empty">
              <strong>
                {error ? "Your workspace is unavailable." : "Opening your workspace…"}
              </strong>
              <p>
                {error
                  ? "Retry the connection to load your saved tasks."
                  : "Your tasks and completed sessions will appear here."}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="desk-empty">
              <span className="empty-mark" aria-hidden="true">
                ✓
              </span>
              <strong>
                {tasks.length === 0
                  ? "A clear desk. A fresh start."
                  : query
                    ? "No matching tasks."
                    : filter === "done"
                      ? "Progress starts with one task."
                      : "Everything here is done."}
              </strong>
              <p>
                {tasks.length === 0
                  ? "Add something small enough to make progress on today."
                  : query
                    ? "Try a different search or switch to All."
                    : filter === "done"
                      ? "Mark a task complete and it will appear here."
                      : "Take a breath, or add your next task."}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filtered.map((t) => (
                <li
                  key={t.id}
                  className={`task-row ${selected === t.id ? "is-selected" : ""} ${t.done ? "is-done" : ""}`}
                >
                  <input
                    type="checkbox"
                    aria-label={`Complete ${t.title}`}
                    checked={t.done}
                    disabled={disabled || timer?.taskId === t.id}
                    onChange={() =>
                      void save((current) => ({
                        ...current,
                        tasks: current.tasks.map((item) =>
                          item.id === t.id ? { ...item, done: !item.done } : item,
                        ),
                      }))
                    }
                  />
                  <div className="task-content">
                    {editing === t.id ? (
                      <form
                        className="edit-task"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (
                            editTitle.trim() &&
                            (await save((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === t.id ? { ...item, title: editTitle.trim() } : item,
                              ),
                            })))
                          )
                            setEditing(null);
                        }}
                      >
                        <label className="sr-only" htmlFor={`edit-${t.id}`}>
                          Edit task title
                        </label>
                        <input
                          id={`edit-${t.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={180}
                          required
                          autoFocus
                        />
                        <div>
                          <button disabled={disabled || !editTitle.trim()}>Save changes</button>
                          <button type="button" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <button
                          className="task-name"
                          disabled={t.done || Boolean(timer)}
                          onClick={() => {
                            setSelected(t.id);
                            setNotice(`Selected: ${t.title}`);
                          }}
                        >
                          {t.title}
                        </button>
                        <div className="task-meta">
                          {t.priority === "high" && (
                            <span className="priority-badge">High priority</span>
                          )}
                          {timer?.taskId === t.id ? (
                            <span>In focus · finish or stop the session to edit</span>
                          ) : selected === t.id && !t.done ? (
                            <span>Selected for focus</span>
                          ) : t.done ? (
                            <span>Completed</span>
                          ) : (
                            <span>Choose to focus</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="task-actions">
                    <button
                      aria-label={`Edit ${t.title}`}
                      disabled={disabled || timer?.taskId === t.id}
                      onClick={() => {
                        setEditing(t.id);
                        setEditTitle(t.title);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${t.title}`}
                      disabled={disabled || timer?.taskId === t.id}
                      onClick={() => setDeleting(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                  {deleting === t.id && (
                    <div
                      className="delete-confirm"
                      role="group"
                      aria-label={`Confirm deletion of ${t.title}`}
                    >
                      <span>Delete this task? Session history will remain.</span>
                      <button
                        disabled={disabled}
                        onClick={async () => {
                          if (
                            await save((current) => ({
                              ...current,
                              tasks: current.tasks.filter((item) => item.id !== t.id),
                            }))
                          ) {
                            setDeleting(null);
                            setNotice("Task deleted.");
                          }
                        }}
                      >
                        Confirm delete
                      </button>
                      <button onClick={() => setDeleting(null)}>Keep task</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="focus-column">
          <section className="desk-panel focus-panel" aria-labelledby="focus-title">
            <p className="eyebrow">ONE THING AT A TIME</p>
            <h2 id="focus-title">
              {timer?.mode === "break" ? "A little breathing room." : "Your focus session"}
            </h2>
            <p className="focus-task">
              {timer?.taskTitle ?? task?.title ?? "Select a task to get started."}
            </p>
            <div className="clock-face" role="timer" aria-label="Time remaining" aria-live="off">
              {formatClock(remaining)}
            </div>
            <progress
              className="focus-progress"
              aria-label="Session progress"
              max={timer?.durationMs ?? duration * 60000}
              value={timer ? timer.durationMs - remaining : 0}
            />
            {!timer ? (
              <>
                <div className="duration-options" aria-label="Focus duration">
                  {[15, 25, 50].map((n) => (
                    <button key={n} aria-pressed={duration === n} onClick={() => setDuration(n)}>
                      {n} min
                    </button>
                  ))}
                </div>
                {preferenceError && <p role="alert">{preferenceError}</p>}
                <button
                  className="desk-primary"
                  disabled={disabled || !task}
                  onClick={() => void start("focus")}
                >
                  Start focus
                </button>
                <button
                  className="break-button"
                  disabled={disabled}
                  onClick={() => void start("break")}
                >
                  Take a 5-minute break
                </button>
              </>
            ) : (
              <>
                <button
                  className="desk-primary"
                  disabled={disabled || remaining === 0}
                  onClick={() => void toggleTimer()}
                >
                  {timer.endsAt === null ? "Resume session" : "Pause session"}
                </button>
                <button
                  className="break-button"
                  disabled={disabled}
                  onClick={async () => {
                    if (await save((current) => ({ ...current, timer: null })))
                      setNotice(
                        "Session stopped. Incomplete sessions do not count toward your total.",
                      );
                  }}
                >
                  Stop session
                </button>
              </>
            )}
            <p className="focus-hint">
              {timer
                ? timer.endsAt === null
                  ? "Paused. Continue when you’re ready."
                  : "You can close this page. Your timer keeps its deadline."
                : "Completed focus sessions count toward your daily total."}
            </p>
          </section>
          <section className="desk-panel today-panel" aria-labelledby="today-title">
            <div className="panel-heading">
              <h2 id="today-title">Today’s progress</h2>
              <span>Completed sessions</span>
            </div>
            <div className="today-stats">
              <div>
                <strong>
                  {today.reduce((sum, s) => sum + s.minutes, 0)}
                  <small> min</small>
                </strong>
                <span>Focused time</span>
              </div>
              <div>
                <strong>{today.length}</strong>
                <span>Sessions finished</span>
              </div>
            </div>
            <p>Progress is a few small things, done with care.</p>
          </section>
        </div>
      </div>
      <p className="desk-notice" role="status">
        {notice || "Your tasks and session history are saved to your workspace."}
      </p>
      <section className="desk-panel history-panel" aria-labelledby="history-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">A RECORD OF YOUR ATTENTION</p>
            <h2 id="history-title">Recent focus sessions</h2>
          </div>
          <button disabled={!data} onClick={exportData}>
            Export your data
          </button>
        </div>
        {!data?.sessions.length ? (
          <p className="history-empty">
            Finish your first focus session to start your history. No made-up streaks. Just your
            work.
          </p>
        ) : (
          <ol className="session-list">
            {data.sessions
              .slice(-10)
              .reverse()
              .map((s) => (
                <li key={s.id}>
                  <span className="session-check" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <strong>{s.taskTitle}</strong>
                    <time dateTime={new Date(s.completedAt).toISOString()}>
                      {new Date(s.completedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <span>{s.minutes} min</span>
                </li>
              ))}
          </ol>
        )}
      </section>
    </main>
  );
}
