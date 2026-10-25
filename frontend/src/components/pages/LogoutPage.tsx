import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/', { replace: true });
    };

    void performLogout();
  }, [logout, navigate]);

  return (
    <section className="mx-auto max-w-sm px-4 py-16 text-center">
      <p className="text-ink-soft">Logging out…</p>
    </section>
  );
}
