import { useEffect, useState } from 'react';

export type Route = 'home' | 'signup';

function readRoute(): Route {
  return window.location.hash === '#/signup' ? 'signup' : 'home';
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
