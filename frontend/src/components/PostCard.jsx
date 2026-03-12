import { MdFavoriteBorder, MdOutlineChatBubbleOutline, MdOutlineEdit, MdOutlineDeleteOutline } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function PostCard({ post, isAuthenticated }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/posts/${post.id}/`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate posts query if one exists, but since we mock currently, this is for future proofing.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Temporary alert since posts are currently mocked in PostList.jsx
      alert(`Post ${post.id} deleted successfully (Backend called). Refresh to see mock state reset.`);
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Failed to delete post");
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h2 className="post-title">{post.title}</h2>
        {post.team && <span className="team-badge">{post.team}</span>}
        <span className="author">{post.author}</span>
        <span className="date">{post.date}</span>
      </div>
      
      <p className="post-content">
        {post.excerpt} <a href="#" className="show-more">Show More</a>
      </p>

      <div className="post-footer">
        <div className="stats">
          <span>{post.likesCount} Likes</span>
          <span>{post.commentsCount} Comments</span>
        </div>
        
        <div className="actions">
          {isAuthenticated && (
            <>
              <button className="action-btn" title="Like"><MdFavoriteBorder size={28} /></button>
              <button className="action-btn" title="Comment"><MdOutlineChatBubbleOutline size={28} /></button>
              <button className="action-btn" title="Edit"><MdOutlineEdit size={28} /></button>
              <button 
                className="action-btn" 
                title="Delete" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <MdOutlineDeleteOutline size={28} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
