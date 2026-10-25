import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const { isAuthenticated, isRestoringSession, user } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-ink-soft hover:text-ink'}`;

  return (
    <header className="border-b border-line bg-surface-raised">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-ink">
          MyApp
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact Us
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {isRestoringSession ? null : isAuthenticated ? (
            <>
              <span className="text-sm text-ink-soft">{user?.fullName}</span>
              <Link to="/logout">
                <Button variant="secondary">Log out</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link to="/sign-up">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
