import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import './App.css'

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function App() {
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Query: get CSRF token on mount
  useQuery({
    queryKey: ['csrf'],
    queryFn: async () => {
      const res = await axios.get('/api/csrf/')
      return res.data
    },
    staleTime: Infinity,
  })

  // Query: whoami
  const { data: userAuth, isLoading } = useQuery({
    queryKey: ['whoami'],
    queryFn: async () => {
      const res = await axios.get('/api/whoami/')
      return res.data
    },
    retry: false
  })

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await axios.post('/api/login/', credentials)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/logout/')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const handleLogin = (e) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  if (isLoading) return <div className="loading">Loading session...</div>

  return (
    <div className="app-container">
      <div className="glass-panel">
        <div className="header">
          <h1>React + Django + TanStack</h1>
          <p className="subtitle">Secure Session Authentication</p>
        </div>
        
        {userAuth?.isAuthenticated ? (
          <div className="dashboard">
            <div className="avatar">
              {userAuth.username.charAt(0).toUpperCase()}
            </div>
            <h2>Welcome back, <span>{userAuth.username}</span>!</h2>
            <br />
            <button className="logout-btn" onClick={() => logoutMutation.mutate()}>
              Secure Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <h2>Sign In to Continue</h2>
            {loginMutation.isError && (
              <div className="error-badge">
                Invalid credentials. Hint: use admin/admin
              </div>
            )}
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
