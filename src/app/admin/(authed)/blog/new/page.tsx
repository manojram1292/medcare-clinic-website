import { getAuthors } from '@/lib/data';
import BlogForm from '../BlogForm';

export default async function NewPostPage() {
  const authors = await getAuthors();
  return (
    <>
      <h1 className="admin-h1">New post</h1>
      <BlogForm authors={authors} />
    </>
  );
}
