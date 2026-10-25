import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertVariant } from '../../types/ui';
import { extractApiError } from '../../utils/apiErrors';

export function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError(extractApiError(err, 'Failed to sign up. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Sign up</h1>

      {error && (
        <div className="mt-4">
          <Alert variant={AlertVariant.Danger}>{error}</Alert>
        </div>
      )}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          name="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
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
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand">
          Log in
        </Link>
      </p>
    </section>
  );
}
