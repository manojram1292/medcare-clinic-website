import { notFound } from 'next/navigation';
import { getAuthors, getPosts } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import BlogForm from '../BlogForm';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  await requireAdmin('blog');
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);
  const post = posts.find((p) => p.id === params.id);
  if (!post) notFound();
  return (
    <>
      <h1 className="admin-h1">Edit post</h1>
      <BlogForm authors={authors} post={post} />
    </>
  );
}
