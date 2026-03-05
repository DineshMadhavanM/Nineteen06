import React, { useState } from 'react';
import './Auth.css';
import logo from '../assets/images/Logo.png';

interface AuthProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
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
        } catch (err) {
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
