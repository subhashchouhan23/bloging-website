import Header from './components/Header';
import Home from './pages/Home';
import Signup from './pages/Signup';
import { useAuth } from './hooks/useAuth';
import { useHashRoute } from './hooks/useHashRoute';

function App() {
  const route = useHashRoute();
  const { user } = useAuth();

  return (
    <>
      <Header user={user} />
      {route === 'signup' ? <Signup user={user} /> : <Home />}
    </>
  );
}

export default App;
