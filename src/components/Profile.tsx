import React, { useState } from 'react';
import './Profile.css';
import { LoyaltyCard } from './LoyaltyCard';
import { apiUrl } from '../lib/api';

interface ProfileProps {
    user: {
        email: string;
        username?: string;
        phone?: string;
        city?: string;
        isAdmin?: boolean;
        loyaltyCakes?: boolean[];
    };
    onClose: () => void;
    onLogout: () => void;
    onUpdate: (updatedUser: {
        email: string;
        username?: string;
        phone?: string;
        city?: string;
        isAdmin?: boolean;
        loyaltyCakes?: boolean[];
    }) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onClose, onLogout, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'loyalty'>('details');
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
            const response = await fetch(apiUrl('/api/auth/profile'), {
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
        } catch {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-overlay">
            <div className="profile-modal">
                <button className="btn-close-profile" onClick={onClose}>×</button>

                {!isEditing && (
                    <div className="profile-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            My Details
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
                            onClick={() => setActiveTab('loyalty')}
                        >
                            Loyalty Reward
                        </button>
                    </div>
                )}

                <div className="profile-content">
                    {activeTab === 'loyalty' && !isEditing ? (
                        <div className="loyalty-tab-content">
                            <LoyaltyCard
                                username={user.username}
                                email={user.email}
                                loyaltyCakes={user.loyaltyCakes}
                            />
                        </div>
                    ) : (
                        <div className="details-tab-content">
                            <div className="profile-header-compact">
                                <h2 className="serif">{isEditing ? 'Editing Profile' : 'Manage Profile'}</h2>
                                {!isEditing && <p className="profile-email-sub">{user.email}</p>}
                            </div>

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
                    )}
                </div>

                <div className="profile-footer">
                    <p>Homemade with Love • Since 1906</p>
                </div>
            </div>
        </div>
    );
};
