import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-ink">Welcome to MyApp</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
        This is placeholder marketing copy — replace it with your own product
        description.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/sign-up">
          <Button>Get started</Button>
        </Link>
        <Link to="/about">
          <Button variant="secondary">Learn more</Button>
        </Link>
      </div>
    </section>
  );
}
