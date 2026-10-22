import { useState } from 'react';
import { authErrorMessage, signInWithGoogle } from '../lib/auth';
import type { AuthUser } from '../lib/auth';
import { isConfigured } from '../lib/firebase';

// ---- signup page ----
interface SignupProps {
  user: AuthUser | null;
}

function Signup({ user }: SignupProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function handleGoogle() {
    setBusy(true);
    setError('');
    signInWithGoogle()
      .then(() => {
        window.location.hash = '#/';
      })
      .catch(e => {
        setError(authErrorMessage(e));
        setBusy(false);
      });
  }

  if (user) {
    return (
      <main className="signup">
        <section className="signup-card">
          <p className="signup-eyebrow">Signed in</p>
          <h1 className="signup-title">You are in</h1>
          <p className="signup-copy">{user.displayName || user.email}</p>
          <a className="signup-back" href="#/">Back to posts</a>
        </section>
      </main>
    );
  }

  return (
    <main className="signup">
      <section className="signup-card">
        <p className="signup-eyebrow">Create account</p>
        <h1 className="signup-title">Join notes</h1>
        <p className="signup-copy">Save posts, upload images and keep a reading list in one place.</p>
        {isConfigured ? null : (
          <p className="signup-note">Firebase config missing. Add VITE_FIREBASE_* values to .env.local.</p>
        )}
        <button type="button" className="google-button" onClick={handleGoogle} disabled={busy}>
          <img className="google-icon" src="/google.svg" alt="" width="18" height="18" />
          <span>{busy ? 'Connecting...' : 'Continue with Google'}</span>
        </button>
        {error ? <p className="signup-error">{error}</p> : null}
        <p className="signup-terms">By continuing you agree to the terms and privacy policy.</p>
        <a className="signup-back" href="#/">Back to posts</a>
      </section>
    </main>
  );
}

export default Signup;
