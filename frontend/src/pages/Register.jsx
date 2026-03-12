import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

export default function Register() {
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await axios.post('/api/register/', credentials);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] });
      navigate('/login');
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    registerMutation.mutate({ username: email, password: registerPassword });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
      <form onSubmit={handleRegister} style={{ background: '#fff', padding: '40px', border: '3px solid #000', borderRadius: '12px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Create an Account</h2>
        
        {registerMutation.isError && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', border: '1px solid #ef5350' }}>
            {registerMutation.error.response?.data?.error || 'Registration failed'}
          </div>
        )}

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Email</label>
          <input 
            type="email" 
            placeholder="johndoe@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '4px' }}
          />
        </div>

        <div>
           <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Password</label>
           <div style={{ position: 'relative' }}>
             <input 
               type={showRegisterPassword ? "text" : "password"} 
               placeholder="Password" 
               value={registerPassword} 
               onChange={e => setRegisterPassword(e.target.value)} 
               required
               style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '4px', paddingRight: '40px' }}
             />
             <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                title={showRegisterPassword ? "Hide password" : "Show password"}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
           </div>
        </div>

        <div>
           <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
           <div style={{ position: 'relative' }}>
             <input 
               type={showConfirmPassword ? "text" : "password"} 
               placeholder="Confirm Password" 
               value={confirmPassword} 
               onChange={e => setConfirmPassword(e.target.value)} 
               required
               style={{ width: '100%', padding: '10px', border: '2px solid #000', borderRadius: '4px', paddingRight: '40px' }}
             />
             <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
           </div>
        </div>

        <button type="submit" disabled={registerMutation.isPending} style={{ background: '#3b82f6', color: '#fff', fontSize: '1.1rem', padding: '12px', border: '2px solid #000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Sign In</span>
        </p>
      </form>
    </div>
  );
}
