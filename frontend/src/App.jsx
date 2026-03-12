import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

function Dashboard({ userAuth, logoutMutation }) {
  return (
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
  )
}

function LoginForm({ loginMutation }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
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
      <div className="input-group" style={{ position: 'relative' }}>
        <input 
          type={showPassword ? "text" : "password"} 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button type="submit" className="login-btn" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
      </button>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/register')}>Sign Up</span>
      </p>
    </form>
  )
}

function RegisterForm({ registerMutation }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = (e) => {
    e.preventDefault()
    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    registerMutation.mutate({ username: email, password: registerPassword })
  }

  return (
    <form onSubmit={handleRegister} className="login-form">
      <h2>Create an Account</h2>
      {registerMutation.isError && (
        <div className="error-badge">
          {registerMutation.error.response?.data?.error || 'Registration failed'}
        </div>
      )}
      <div className="input-group">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
        />
      </div>
      <div className="input-group" style={{ position: 'relative' }}>
        <input 
          type={showRegisterPassword ? "text" : "password"} 
          placeholder="Password" 
          value={registerPassword} 
          onChange={e => setRegisterPassword(e.target.value)} 
          required
        />
        <button 
          type="button" 
          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}
        >
          {showRegisterPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="input-group" style={{ position: 'relative' }}>
        <input 
          type={showConfirmPassword ? "text" : "password"} 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required
        />
        <button 
          type="button" 
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button type="submit" className="login-btn" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/')}>Sign In</span>
      </p>
    </form>
  )
}

function MainApp() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useQuery({
    queryKey: ['csrf'],
    queryFn: async () => {
      const res = await axios.get('/api/csrf/')
      return res.data
    },
    staleTime: Infinity,
  })

  const { data: userAuth, isLoading } = useQuery({
    queryKey: ['whoami'],
    queryFn: async () => {
      const res = await axios.get('/api/whoami/')
      return res.data
    },
    retry: false
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await axios.post('/api/login/', credentials)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
      navigate('/')
    }
  })

  // Mutation: Register
  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await axios.post('/api/register/', credentials)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
      navigate('/')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/logout/')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  if (isLoading) return <div className="loading">Loading session...</div>

  return (
    <div className="app-container">
      <div className="glass-panel">
        <div className="header">
          <h1>React + Django + TanStack</h1>
          <p className="subtitle">Secure Session Authentication</p>
        </div>
        
        {userAuth?.isAuthenticated ? (
          <Dashboard userAuth={userAuth} logoutMutation={logoutMutation} />
        ) : (
          <Routes>
            <Route path="/register" element={<RegisterForm registerMutation={registerMutation} />} />
            <Route path="/" element={<LoginForm loginMutation={loginMutation} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  )
}

export default App
