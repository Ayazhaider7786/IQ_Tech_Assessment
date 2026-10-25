export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </div>
    </footer>
  );
}
