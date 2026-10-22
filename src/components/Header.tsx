import { signOutUser } from '../lib/auth';
import type { AuthUser } from '../lib/auth';

interface HeaderProps {
  user: AuthUser | null;
}

function Header({ user }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="site-name" href="#/">notes</a>
      <div className="site-actions">
        <p className="site-tagline">Code, tools and the web</p>
        {user ? (
          <>
            <span className="site-user">{user.displayName || user.email}</span>
            <button type="button" className="link-button" onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <a className="signup-link" href="#/signup">Sign up</a>
        )}
      </div>
    </header>
  );
}

function handleSignOut() {
  signOutUser().catch(() => undefined);
}

export default Header;
