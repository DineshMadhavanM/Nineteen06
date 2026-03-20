import React, { useState } from 'react';
import './Auth.css';
import logo from '../assets/images/Logo.png';
import { apiUrl } from '../lib/api';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthProps {
    onClose: () => void;
    onSuccess: (user: {
        email: string;
        username?: string;
        phone?: string;
        city?: string;
        isAdmin?: boolean;
        loyaltyCakes?: boolean[];
    }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const response = await fetch(apiUrl('/api/auth/google'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                onSuccess(data.user);
                onClose();
            } else {
                setError(data.message || 'Google Authentication failed');
            }
        } catch (err: any) {
            console.error('Google Sign-In Full Error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Login cancelled or popup blocked. Please allow popups for this site.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google Sign-In is not enabled in Firebase Console.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Please check your internet connection or disable ad-blockers.');
            } else if (err.code === 'auth/internal-error') {
                setError('Firebase Internal Error. Check if your domain (localhost) is authorized in Firebase Console.');
            } else {
                setError(`Sign-in failed: ${err.message || 'Please try again.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? apiUrl('/api/auth/login') : apiUrl('/api/auth/signup');
            const body = isLogin
                ? { email, password }
                : { email, password, username, phone, city };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                onSuccess(data.user);
                onClose();
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch {
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal">
                <button className="btn-close-auth" onClick={onClose}>×</button>

                <div className="auth-logo-bg">
                    <img src={logo} alt="NINETEEN 06 Logo" className="logo-watermark" />
                </div>

                <div className="auth-content">
                    <h2 className="serif">{isLogin ? 'Welcome Back' : 'Join NINETEEN 06'}</h2>
                    <p className="auth-subtitle">Freshly made • Made with love</p>

                    <button 
                        type="button" 
                        className="btn-google-auth" 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        <span>Continue with Google</span>
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            placeholder="Enter phone"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                            placeholder="Enter city"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && <p className="auth-error">{error}</p>}

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLogin(!isLogin)} className="btn-toggle-auth">
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
