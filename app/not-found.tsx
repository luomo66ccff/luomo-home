import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="luomo-card not-found-card">
        <p className="eyebrow">Signal Lost</p>
        <h1>404 · Cloud gate not found</h1>
        <p className="page-subtitle">The constellation has no route for this little star.</p>
        <Link className="btn btn-primary" href="/">
          Return to Luomo Cloud
        </Link>
      </div>
    </main>
  );
}
