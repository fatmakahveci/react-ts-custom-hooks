"use client";

import { useEffect, useRef, useState } from "react";

interface CodeExampleProps {
  code: string;
  label: string;
}

const COPY_SUCCESS = "Copied to clipboard.";
const COPY_FALLBACK = "Copy unavailable. Select the code below to copy it manually.";

export default function CodeExample({ code, label }: CodeExampleProps) {
  const [message, setMessage] = useState("");
  const request = useRef(0);

  useEffect(() => {
    // Ignore pending clipboard work after this configuration panel is removed.
    return () => {
      request.current += 1;
    };
  }, []);

  async function copy() {
    // Clipboard promises may finish out of order; only the latest click owns feedback.
    const current = ++request.current;
    setMessage("");
    try {
      await navigator.clipboard.writeText(code);
      if (current === request.current) setMessage(COPY_SUCCESS);
    } catch {
      if (current === request.current) setMessage(COPY_FALLBACK);
    }
  }

  return (
    <div className="code-panel">
      <div className="code-heading">
        <span>{label}</span>
        <button type="button" className="copy-button" onClick={copy} aria-label={`Copy ${label}`}>
          Copy code
        </button>
      </div>
      <pre tabIndex={0} aria-label={label}>
        <code>{code}</code>
      </pre>
      {message && (
        <p className="copy-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
