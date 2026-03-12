import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await axios.post('/api/login/', credentials);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] });
      navigate('/');
    }
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', border: '3px solid #000', borderRadius: '12px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Sign In</h2>
        
        {loginMutation.isError && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', border: '1px solid #ef5350' }}>
            Invalid credentials. Use your email.
          </div>
        )}

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email</label>
          <input 
            type="text" 
            placeholder="admin@example.com" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '4px' }}
          />
        </div>

        <div>
           <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password</label>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '4px' }}
          />
        </div>

        <button type="submit" disabled={loginMutation.isPending} style={{ background: '#3b82f6', color: '#fff', fontSize: '1.1rem', padding: '12px', border: '2px solid #000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}
