import { useEffect, useState } from 'react';
import { watchAuth } from '../lib/auth';
import type { AuthUser } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stop = watchAuth(next => {
      setUser(next);
      setReady(true);
    });
    return () => { stop(); };
  }, []);

  return { user, ready };
}
