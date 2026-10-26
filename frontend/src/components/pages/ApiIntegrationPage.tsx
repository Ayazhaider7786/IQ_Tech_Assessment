import { useEffect, useState } from 'react';
import { jokeService } from '../../services/jokeService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';
import { extractApiError } from '../../utils/apiErrors';
import type { JokeResponse } from '../../types/joke';

export function ApiIntegrationPage() {
  const [joke, setJoke] = useState<JokeResponse | null>(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJoke = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await jokeService.getRandomJoke();
      setJoke(data);
      setShowPunchline(false);
    } catch (err) {
      setError(extractApiError(err, 'Failed to fetch a joke. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        void fetchJoke();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Api Integration</h1>
      <p className="mt-2 text-ink-soft">
        Random joke from{' '}
        <a
          href="https://official-joke-api.appspot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand"
        >
          official-joke-api.appspot.com
        </a>
        . Press Enter or click the button below.
      </p>

      {error && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Danger}>{error}</Alert>
        </div>
      )}

      {joke && (
        <div className="mt-6 rounded-lg border border-line bg-surface-raised p-6">
          <p className="text-lg text-ink">{joke.setup}</p>
          {showPunchline && <p className="mt-3 text-lg font-semibold text-brand">{joke.punchline}</p>}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button onClick={() => void fetchJoke()} isLoading={isLoading}>
          Give me a joke
        </Button>

        {joke && !showPunchline && (
          <Button variant="secondary" onClick={() => setShowPunchline(true)}>
            Show Punchline
          </Button>
        )}

        {showPunchline && (
          <Button variant="secondary" onClick={() => void fetchJoke()} isLoading={isLoading}>
            Next Joke
          </Button>
        )}
      </div>
    </section>
  );
}
