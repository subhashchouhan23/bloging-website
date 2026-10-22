import type { Post } from '../lib/posts';

interface PostRowProps {
  post: Post;
}

function PostRow({ post }: PostRowProps) {
  return (
    <li className="post-row">
      <div className="post-meta">
        <span>{post.category}</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>{post.readMinutes} min read</span>
      </div>
      <h2 className="post-title">{post.title}</h2>
      <p className="post-excerpt">{post.excerpt}</p>
      <p className="post-author">By {post.author}</p>
    </li>
  );
}

function formatDate(value: string) {
  const date = new Date(value + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default PostRow;
