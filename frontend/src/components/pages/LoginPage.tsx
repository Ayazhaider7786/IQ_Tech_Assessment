import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';
import { extractApiError } from '../../utils/apiErrors';
import { seedDataService } from '../../services/seedDataService';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(extractApiError(err, 'Failed to log in. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSeedData = async () => {
    try {
      const [seedUser] = await seedDataService.getSeedUsers();
      if (seedUser) {
        setEmail(seedUser.email);
        setPassword(seedUser.password);
      }
    } catch (err) {
      setError(extractApiError(err, 'Failed to load seed data.'));
    }
  };

  return (
    <section className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Log in</h1>

      {error && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Danger}>{error}</Alert>
        </div>
      )}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      {import.meta.env.DEV && (
        <Button variant="ghost" className="mt-4 w-full" onClick={() => void fillSeedData()} type="button">
          Fill with seed data
        </Button>
      )}

      <p className="mt-6 text-sm text-ink-soft">
        Don't have an account?{' '}
        <Link to="/sign-up" className="font-medium text-brand">
          Sign up
        </Link>
      </p>
    </section>
  );
}
