import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Calendar, Clock, BookOpen } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  formattedDate: string;
  excerpt: string;
  readingTime: string;
  originalUrl: string;
}

export const BlogReader: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/blog/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts);
        setLoading(false);
      });
  }, []);

  const handlePostClick = (slug: string) => {
    setLoading(true);
    fetch(`/api/blog/posts/${slug}`)
      .then(res => res.json())
      .then(data => {
        setSelectedPost(data);
        setLoading(false);
      });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-950 min-h-screen">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-800">
          <ChevronLeft className="w-5 h-5" /> Back to list
        </button>
        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold mb-4">{selectedPost.title}</h1>
          <div className="flex gap-4 text-slate-500 mb-8">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedPost.formattedDate}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedPost.readingTime}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: selectedPost.contentHtml }} />
        </article>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">System Design</h1>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search posts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-900"
        />
      </div>
      <div className="grid gap-6">
        {filteredPosts.map(post => (
          <div key={post.id} className="p-6 border rounded-xl hover:shadow-lg transition-shadow dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-2 cursor-pointer hover:text-blue-600" onClick={() => handlePostClick(post.slug)}>{post.title}</h2>
            <p className="text-slate-600 mb-4 dark:text-slate-400">{post.excerpt}</p>
            <div className="flex gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.formattedDate}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {post.readingTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
