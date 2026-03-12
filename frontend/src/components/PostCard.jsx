import { MdFavoriteBorder, MdOutlineChatBubbleOutline, MdOutlineEdit, MdOutlineDeleteOutline } from 'react-icons/md';

export default function PostCard({ post, isAuthenticated }) {
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
              <button className="action-btn" title="Delete"><MdOutlineDeleteOutline size={28} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
