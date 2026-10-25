import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getAuthRedirectURL } from '../services/supabase';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Helper to format Supabase user into unified app user object
  const mapSupabaseUser = (sbUser, sbSession) => {
    if (!sbUser) return null;
    const metadata = sbUser.user_metadata || {};
    return {
      _id: sbUser.id,
      id: sbUser.id,
      email: sbUser.email,
      name: metadata.name || metadata.full_name || sbUser.email.split('@')[0],
      role: metadata.role || 'customer',
      phone: metadata.phone || '',
      avatar: metadata.avatar || '',
      emailConfirmed: Boolean(sbUser.email_confirmed_at),
      token: sbSession?.access_token || token,
    };
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 1. If Supabase is configured, use official Supabase Auth session & listeners
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (mounted && initialSession?.user) {
            const mapped = mapSupabaseUser(initialSession.user, initialSession);
            setUser(mapped);
            setSession(initialSession);
            setToken(initialSession.access_token);
            localStorage.setItem('token', initialSession.access_token);
            localStorage.setItem('user', JSON.stringify(mapped));
          }
        } catch (err) {
          console.error('[Auth]: Error initializing Supabase session:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        // Listen for active Supabase auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (newSession?.user) {
                const mapped = mapSupabaseUser(newSession.user, newSession);
                setUser(mapped);
                setSession(newSession);
                setToken(newSession.access_token);
                localStorage.setItem('token', newSession.access_token);
                localStorage.setItem('user', JSON.stringify(mapped));
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
              setToken(null);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        );

        return () => {
          mounted = false;
          subscription?.unsubscribe();
        };
      }

      // 2. Fallback to existing REST API authentication if Supabase keys not yet configured
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data && mounted) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('[Auth]: Fallback session check failed:', err);
          logout(false);
        }
      }
      if (mounted) setLoading(false);
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * User Signup
   * Enforces email confirmation: does NOT automatically mark unverified accounts as verified.
   */
  const register = async ({ name, email, password, phone }) => {
    // 1. Supabase Auth Signup
    if (isSupabaseConfigured) {
      const redirectUrl = getAuthRedirectURL('/auth/confirm');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            role: 'customer',
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes('error sending confirmation email')) {
          throw new Error(
            'Supabase failed to send confirmation email. In Supabase Dashboard -> Authentication -> Providers -> Email, verify your Custom SMTP (Resend) settings or temporarily toggle "Confirm email" OFF.'
          );
        }
        throw new Error(error.message);
      }

      // Check if user requires email confirmation (standard production behavior)
      const isConfirmed = Boolean(data.user?.email_confirmed_at);
      if (!isConfirmed) {
        return {
          needsEmailConfirmation: true,
          email: email.trim(),
          user: data.user,
        };
      }

      // If email confirmation is disabled on Supabase project, establish session
      if (data.session && data.user) {
        const mapped = mapSupabaseUser(data.user, data.session);
        setUser(mapped);
        setSession(data.session);
        setToken(data.session.access_token);
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(mapped));
        return { needsEmailConfirmation: false, user: mapped };
      }
    }

    // 2. Fallback REST API
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.success && res.data) {
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { needsEmailConfirmation: false, user: userData };
    }
    throw new Error(res.message || 'Registration failed');
  };

  /**
   * User Login
   * Validates credentials with Supabase, with automatic fallback for existing demo/local accounts.
   */
  const login = async (email, password) => {
    // 1. Supabase Auth Sign In
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Intercept unconfirmed email error
        if (
          error.message?.toLowerCase().includes('email not confirmed') ||
          error.message?.toLowerCase().includes('not verified')
        ) {
          const err = new Error('Please verify your email address before signing in.');
          err.isUnverified = true;
          err.email = email.trim();
          throw err;
        }

        // Graceful fallback to backend REST API (supports pre-seeded demo/admin accounts)
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.success && res.data) {
            const userData = res.data;
            setUser(userData);
            setToken(userData.token);
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));
            showToast(`Welcome back, ${userData.name}!`, 'success');
            return userData;
          }
        } catch {
          // If backend also fails, throw original Supabase message
        }

        throw new Error(error.message || 'Invalid email or password');
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      // Explicit check for unconfirmed email
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        const err = new Error('Please verify your email address before signing in.');
        err.isUnverified = true;
        err.email = email.trim();
        throw err;
      }

      const mapped = mapSupabaseUser(data.user, data.session);
      setUser(mapped);
      setSession(data.session);
      setToken(data.session.access_token);
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(mapped));
      showToast(`Welcome back, ${mapped.name}!`, 'success');
      return mapped;
    }

    // 2. Fallback REST API
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const userData = res.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  /**
   * Resend Email Verification link
   */
  const resendVerification = async (email) => {
    if (isSupabaseConfigured) {
      const redirectUrl = getAuthRedirectURL('/auth/confirm');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      return true;
    }

    showToast('Verification email simulated. Please check your inbox.', 'info');
    return true;
  };

  /**
   * Forgot Password request
   */
  const forgotPassword = async (email) => {
    if (isSupabaseConfigured) {
      const redirectUrl = getAuthRedirectURL('/reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
      return true;
    }

    const res = await api.post('/auth/forgot-password', { email });
    return res;
  };

  /**
   * Reset Password with new password
   */
  const resetPassword = async (newPassword) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
      return true;
    }

    return true;
  };

  /**
   * User Logout
   */
  const logout = async (notify = true) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[Auth]: Supabase signout error:', err);
      }
    }

    setUser(null);
    setSession(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (notify) {
      showToast('You have been logged out.', 'info');
    }
  };

  /**
   * Update Profile Details
   */
  const updateProfile = async (data) => {
    if (isSupabaseConfigured && session?.user) {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          phone: data.phone,
          avatar: data.avatar,
        },
      });

      if (error) throw new Error(error.message);

      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      showToast('Profile updated successfully', 'success');
      return updated;
    }

    const res = await api.put('/auth/profile', data);
    if (res.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      showToast('Profile updated successfully', 'success');
      return res.data;
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = isAuthenticated && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        session,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
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

export default AuthContext;
