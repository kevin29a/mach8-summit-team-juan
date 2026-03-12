import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PostList() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const fetchPosts = async (currentPage) => {
    const res = await axios.get(`/api/post/?page=${currentPage}`);
    // Extracting data since typical DRF paginated response returns { count, next, previous, results }
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (isLoading) {
    return <div className="post-list" style={{ textAlign: 'center', padding: '40px' }}>Loading feed...</div>;
  }

  if (isError) {
    return <div className="post-list" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error loading feed.</div>;
  }

  const posts = data?.results || [];
  const totalPages = data?.total_pages || Math.ceil((data?.count || 0) / 10) || 1;

  return (
    <div className="post-list">
      {posts.map((postData) => {
        // Map backend API data to the exact schema the original mock used
        const mappedPost = {
          id: postData.id,
          title: postData.title,
          team: postData.team_name || 'General',
          author: postData.author_name,
          date: new Date(postData.timestamp).toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }).replace(',', ''),
          excerpt: postData.excerpt,
          likesCount: postData.like_count || 0,
          commentsCount: 0
        };

        return (
          <div key={mappedPost.id}>
            <PostCard post={mappedPost} isAuthenticated={isAuthenticated} />
            {/* Pagination Dashes below each post as requested in mockup visual style */}
            <div className="pagination">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="page-dash"></div>
              ))}
            </div>
          </div>
        );
      })}
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontWeight: 'bold' }}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            style={{ padding: '8px 16px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ padding: '8px' }}>Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            style={{ padding: '8px 16px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
      
      {isAuthenticated && (
        <button 
          className="fab" 
          title="Create New Post"
          onClick={() => navigate('/create-post')}
        >
          +
        </button>
      )}
    </div>
  );
}
