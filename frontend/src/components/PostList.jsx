import PostCard from './PostCard';
import { useAuth } from '../context/AuthContext';

const mockPosts = [
  {
    id: 1,
    title: '1st post',
    team: 'Team Alpha',
    author: 'Sam O',
    date: '30/02/2021 13:01:02',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ......',
    likesCount: 13,
    commentsCount: 2
  },
  {
    id: 2,
    title: 'My Second Post',
    team: 'Beta Team',
    author: 'Kevin Thompson',
    date: '01/03/2021 09:15:05',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ......',
    likesCount: 19,
    commentsCount: 4
  }
];

export default function PostList() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="post-list">
      {mockPosts.map((post, index) => (
        <div key={post.id}>
          <PostCard post={post} isAuthenticated={isAuthenticated} />
          {/* Pagination Dashes below each post as requested in mockup visual style */}
          <div className="pagination">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="page-dash"></div>
            ))}
          </div>
        </div>
      ))}
      
      {isAuthenticated && (
        <button className="fab" title="Create New Post">
          +
        </button>
      )}
    </div>
  );
}
