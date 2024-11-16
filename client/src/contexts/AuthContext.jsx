import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { auth } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Session management with React Query
  const { data: session, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: auth.getMe,
    retry: 0,
    refetchOnWindowFocus: false,
    onError: () => {
      queryClient.setQueryData(['auth'], null);
    }
  });

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth'], response);
      navigate('/');
    }
  });

  const registerMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth'], response);
      navigate('/');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: auth.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();
      navigate('/login');
    }
  });

  // Check auth status when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await auth.getMe();
        queryClient.setQueryData(['auth'], response);
      } catch (error) {
        queryClient.setQueryData(['auth'], null);
      }
    };

    checkAuth();
  }, [queryClient]);

  const value = {
    user: session?.data?.data?.user || null,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 