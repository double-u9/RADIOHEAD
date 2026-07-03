
"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    fetch("/api/log", {
      method: "POST",
      body: JSON.stringify({ message: error.message, stack: error.stack })
    }).catch(console.error);
  }, [error]);
  return (
    <div style={{ color: "white", padding: "2rem" }}>
      <h2>Captured Error!</h2>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <pre>{error.stack}</pre>
      <button onClick={reset}>Try again</button>
    </div>
  );
}