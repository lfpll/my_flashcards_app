import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';

interface AuthFormProps {
  onClose: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const { error } = mode === 'signup' 
      ? await signUp(email, password)
      : await signIn(email, password);
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === 'login' ? 'Sign In' : 'Sign Up'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        
        {mode === 'signup' && (
          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        )}
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <Button type="submit" fullWidth loading={loading}>
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
        
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
          className="text-sm text-theme-textDim hover:text-theme-text w-full text-center"
        >
          {mode === 'login' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Log in'}
        </button>
      </form>
    </Modal>
  );
}


