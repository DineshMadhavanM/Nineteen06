import React, { useState } from 'react';
import './Profile.css';
import logo from '../assets/images/Logo.png';

interface ProfileProps {
    user: {
        email: string;
        username?: string;
        phone?: string;
        city?: string;
        isAdmin?: boolean;
    };
    onClose: () => void;
    onLogout: () => void;
    onUpdate: (updatedUser: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onClose, onLogout, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: user.username || '',
        phone: user.phone || '',
        city: user.city || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify(editData),
            });

            const data = await response.json();
            if (response.ok) {
                onUpdate(data);
                setIsEditing(false);
            } else {
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-overlay">
            <div className="profile-modal">
                <button className="btn-close-profile" onClick={onClose}>×</button>

                <div className="profile-header">
                    <div className="profile-logo-bg">
                        <img src={logo} alt="Logo" className="logo-watermark" />
                    </div>
                    <h2 className="serif">{isEditing ? 'Edit Profile' : 'Your Profile'}</h2>
                    <p className="profile-subtitle">
                        {user.isAdmin ? 'Administrator' : 'Member'} of NINETEEN 06
                    </p>
                </div>

                <div className="profile-content">
                    {error && <p className="profile-error">{error}</p>}

                    <div className="profile-details">
                        <div className="detail-item">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={editData.username}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                />
                            ) : (
                                <p>{user.username || 'Not provided'}</p>
                            )}
                        </div>
                        <div className="detail-item">
                            <label>Email Address</label>
                            <p className="read-only-email">{user.email}</p>
                        </div>
                        <div className="detail-row">
                            <div className="detail-item">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        className="edit-input"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    />
                                ) : (
                                    <p>{user.phone || 'Not provided'}</p>
                                )}
                            </div>
                            <div className="detail-item">
                                <label>City</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="edit-input"
                                        value={editData.city}
                                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                    />
                                ) : (
                                    <p>{user.city || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button className="btn-save-profile" onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button className="btn-cancel-edit" onClick={() => setIsEditing(false)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="btn-logout-profile" onClick={() => {
                                    onLogout();
                                    onClose();
                                }}>Sign Out</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile-footer">
                    <p>Thank you for being part of our sweet journey.</p>
                </div>
            </div>
        </div>
    );
};
