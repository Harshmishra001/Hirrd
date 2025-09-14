import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';

// Wrapper components for compatibility with Clerk API
export const SignedIn = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? children : null;
};

export const SignedOut = ({ children }) => {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? children : null;
};

export const SignInComponent = ({ 
  signUpForceRedirectUrl, 
  fallbackRedirectUrl, 
  allowSignUp = true,
  onSuccess: externalOnSuccess
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    // Call external onSuccess first (to close modal, etc.)
    externalOnSuccess?.();
    
    // Handle role-based redirect logic
    if (user?.role === 'recruiter') {
      navigate('/recruiter-dashboard');
    } else if (user?.role === 'candidate') {
      navigate('/jobs');
    } else {
      // Default fallback
      navigate('/jobs');
    }
  };

  if (isSignUp && allowSignUp) {
    return (
      <SignUp
        onSuccess={handleSuccess}
        onSwitchToSignIn={() => setIsSignUp(false)}
      />
    );
  }

  return (
    <SignIn
      onSuccess={handleSuccess}
      onSwitchToSignUp={allowSignUp ? () => setIsSignUp(true) : undefined}
    />
  );
};

export { default as UserButton } from './UserButton';

