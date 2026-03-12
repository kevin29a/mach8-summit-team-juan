import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SimpleMdeReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { useAuth } from '../context/AuthContext';
import './CreatePost.css';

const ACCESS_LEVELS = {
  NONE: 'None',
  READ_ONLY: 'Read Only',
  READ_WRITE: 'Read and Write'
};

export default function CreatePost() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publicAccess, setPublicAccess] = useState('READ_ONLY');
  const [authenticatedAccess, setAuthenticatedAccess] = useState('READ_ONLY');
  const [teamAccess, setTeamAccess] = useState('READ_WRITE');
  const [authorAccess, setAuthorAccess] = useState('READ_WRITE');

  // Hierarchy enforcement: Public <= Authenticated <= Team <= Author
  // 0: NONE, 1: READ_ONLY, 2: READ_WRITE
  const levelValue = { NONE: 0, READ_ONLY: 1, READ_WRITE: 2 };
  
  const handlePublicChange = (e) => {
    const val = e.target.value;
    setPublicAccess(val);
    if (levelValue[val] > levelValue[authenticatedAccess]) setAuthenticatedAccess(val);
    if (levelValue[val] > levelValue[teamAccess]) setTeamAccess(val);
    if (levelValue[val] > levelValue[authorAccess]) setAuthorAccess(val);
  };

  const handleAuthenticatedChange = (e) => {
    const val = e.target.value;
    setAuthenticatedAccess(val);
    if (levelValue[val] > levelValue[teamAccess]) setTeamAccess(val);
    if (levelValue[val] > levelValue[authorAccess]) setAuthorAccess(val);
  };

  const handleTeamChange = (e) => {
    const val = e.target.value;
    setTeamAccess(val);
    if (levelValue[val] > levelValue[authorAccess]) setAuthorAccess(val);
  };

  const handleAuthorChange = (e) => {
    setAuthorAccess(e.target.value);
  };

  // Helper to filter dropdown options based on minimum required level
  const getOptions = (minLevelValue) => {
    return Object.entries(ACCESS_LEVELS).map(([key, label]) => {
      const isDisabled = levelValue[key] < minLevelValue;
      return (
        <option key={key} value={key} disabled={isDisabled}>
          {label} {isDisabled ? '(Inherited)' : ''}
        </option>
      );
    });
  };

  const createPostMutation = useMutation({
    mutationFn: async (newPost) => {
      // CSRF requires exact matches, ensure trailing slash and withCredentials are correct
      const res = await axios.post('/api/post/', newPost, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setContent('');
      alert('Post created successfully!');
      navigate('/');
    }
  });

  // Memoize options so SimpleMDE doesn't re-render and lose focus
  const mdeOptions = useMemo(() => {
    return {
      placeholder: 'Write your amazing post here...',
      spellChecker: false,
      hideIcons: ['guide', 'heading']
    };
  }, []);

  // Use useCallback for content change to prevent unnecessary re-renders
  const handleEditorChange = useCallback((value) => {
    setContent(value);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate({
      title,
      content,
      public_access: publicAccess,
      authenticated_access: authenticatedAccess,
      team_access: teamAccess,
      author_access: authorAccess
    });
  };

  return (
    <div className="create-post-container glass-panel">
      <h2>Create New Post</h2>
      {createPostMutation.isError && (
        <div className="error-badge">
          Failed to create post. Please try again.
        </div>
      )}
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="input-group rich-text-group">
          <label>Content</label>
          <SimpleMdeReact 
            value={content} 
            onChange={handleEditorChange}
            options={mdeOptions}
          />
        </div>

        <div className="permissions-group">
          <h3>Access Controls</h3>
          <div className="permissions-grid">
            <div className="input-group">
              <label>Public Access</label>
              <select value={publicAccess} onChange={handlePublicChange}>
                {getOptions(0)}
              </select>
            </div>
            
            <div className="input-group">
              <label>Authenticated Access</label>
              <select value={authenticatedAccess} onChange={handleAuthenticatedChange}>
                {getOptions(levelValue[publicAccess])}
              </select>
            </div>

            <div className="input-group">
              <label>Team Access</label>
              <select value={teamAccess} onChange={handleTeamChange}>
                {getOptions(levelValue[authenticatedAccess])}
              </select>
            </div>

            <div className="input-group">
              <label>Author Access</label>
              <select value={authorAccess} onChange={handleAuthorChange}>
                {getOptions(levelValue[teamAccess])}
              </select>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={createPostMutation.isPending || !title || !content || content === '<p><br></p>'}
          >
            {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
