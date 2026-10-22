import { useEffect, useState } from 'react';
import PostRow from '../components/PostRow';
import { listPosts } from '../lib/posts';
import type { Post } from '../lib/posts';

// ---- home page ----
function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    listPosts()
      .then(next => {
        setPosts(next);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <main className="home">
      <div className="home-head">
        <h1>Latest posts</h1>
        <span>{state === 'ready' ? posts.length + ' articles' : '...'}</span>
      </div>
      {state === 'loading' ? <p className="home-note">Loading posts...</p> : null}
      {state === 'error' ? (
        <p className="home-note">Could not load posts. Check Firestore rules and connection.</p>
      ) : null}
      {state === 'ready' && posts.length === 0 ? <p className="home-note">No posts yet.</p> : null}
      <ol className="post-list">
        {posts.map(post => <PostRow key={post.id} post={post} />)}
      </ol>
    </main>
  );
}

export default Home;
