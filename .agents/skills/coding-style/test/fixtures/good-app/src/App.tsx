import { useEffect, useState } from 'react';
import { listPosts } from './lib/posts';
import type { Post } from './lib/posts';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    listPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <main className="page">
      <h1>Posts</h1>
      <ul>
        {posts.map(p => <li key={p.id}>{p.title}</li>)}
      </ul>
    </main>
  );
}

export default App;
