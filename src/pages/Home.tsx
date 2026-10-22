import { posts } from '../data/posts';
import PostRow from '../components/PostRow';

function Home() {
  return (
    <main className="home">
      <div className="home-head">
        <h1>Latest posts</h1>
        <span>{posts.length} articles</span>
      </div>
      <ol className="post-list">
        {posts.map(post => <PostRow key={post.id} post={post} />)}
      </ol>
    </main>
  );
}

export default Home;
