import { useEffect, useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    void fetch("/api/hello")
      .then((r) => {
        console.log("Response status:", r.status);
        return r.json();
      })
      .then((d) => setMsg(d.message));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Hono + React 18 Streaming (renderToPipeableStream)</h1>
      <p>
        API says: <strong>{msg}</strong>
      </p>
    </main>
  );
}
