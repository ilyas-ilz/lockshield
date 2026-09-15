// WHY a placeholder, not a real homepage: this build is the backend phase
// (data layer, auth, CRUD API, admin panel) — the public marketing site
// (blocks renderer, mobile-first design system) is the next phase, wired
// against this same backend. See backend/README.md.
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", textAlign: "center", padding: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Lock Shield backend</h1>
        <p style={{ marginTop: 8, color: "#555" }}>Public site not wired yet — content is managed in the admin panel.</p>
        <Link href="/admin" style={{ display: "inline-block", marginTop: 16, color: "#e52629", fontWeight: 600 }}>
          Go to admin →
        </Link>
      </div>
    </main>
  );
}
