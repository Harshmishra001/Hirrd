import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const SignIn = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await signIn(email, password);
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-96 relative" style={{ zIndex: 10001 }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Login
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-500 hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo Accounts:</p>
        <div className="text-xs space-y-1">
          <div>Candidate: john@example.com / password123</div>
          <div>Recruiter: jane@example.com / password123</div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;