import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Query: whoami
  const { data: userAuth, isLoading } = useQuery({
    queryKey: ['whoami'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/whoami/');
        return res.data;
      } catch (err) {
        return { isAuthenticated: false };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/logout/');
    },
    onSuccess: () => {
      queryClient.setQueryData(['whoami'], { isAuthenticated: false });
      queryClient.invalidateQueries({ queryKey: ['whoami'] });
      window.location.href = '/login';
    }
  });

  const value = {
    isAuthenticated: userAuth?.isAuthenticated || false,
    user: userAuth || null,
    isLoading,
    logout: () => logoutMutation.mutate(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
