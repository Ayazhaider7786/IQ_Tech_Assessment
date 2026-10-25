import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-sm px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-ink">404</h1>
      <p className="mt-2 text-ink-soft">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Go home</Button>
      </Link>
    </section>
  );
}
