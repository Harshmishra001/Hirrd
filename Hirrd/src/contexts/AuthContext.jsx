import { createContext, useContext, useEffect, useState } from 'react';
import {
    authenticateUser,
    generateToken,
    getStoredToken,
    getUserById,
    registerUser,
    removeStoredToken,
    setStoredToken,
    verifyToken
} from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user, isLoaded } = useAuth();
  return {
    user,
    isLoaded,
    isSignedIn: !!user
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const userData = getUserById(payload.id);
        if (userData) {
          setUser({
            ...userData,
            unsafeMetadata: { role: userData.role }
          });
        }
      } else {
        removeStoredToken();
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const userData = authenticateUser(email, password);
      if (!userData) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(userData);
      setStoredToken(token);
      
      const userWithMethods = {
        ...userData,
        unsafeMetadata: { role: userData.role },
        update: async (data) => {
          // Mock update function
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          return Promise.resolve();
        }
      };
      
      setUser(userWithMethods);
      
      return { success: true, user: userWithMethods };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData) => {
    setIsLoading(true);
    try {
      const newUser = registerUser(userData);
      const token = generateToken(newUser);
      setStoredToken(token);
      
      const userWithMethods = {
        ...newUser,
        unsafeMetadata: { role: newUser.role },
        update: async (data) => {
          // Mock update function
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          return Promise.resolve();
        }
      };
      
      setUser(userWithMethods);
      
      return { success: true, user: userWithMethods };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    removeStoredToken();
    setUser(null);
  };

  const value = {
    user,
    isLoaded,
    isLoading,
    isSignedIn: !!user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};