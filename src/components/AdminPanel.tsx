import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

interface AdminPanelProps {
    onClose: () => void;
}

interface UserData {
    _id: string;
    email: string;
    username?: string;
    phone?: string;
    city?: string;
    isAdmin: boolean;
    loyaltyCakes?: boolean[];
    createdAt: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/admin/users', {
                headers: { 'x-auth-token': token || '' }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch {
            setError('Server connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleCakeToggle = async (userId: string, cakeIndex: number) => {
        console.log(`Toggling cake ${cakeIndex} for user ${userId}`);
        try {
            const token = localStorage.getItem('token');
            const url = `/api/auth/admin/users/${userId}/loyalty`;
            console.log(`Fetching: ${url}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ cakeIndex })
            });
            if (response.ok) {
                // Update local state
                const updatedUsers = users.map(u => {
                    if (u._id === userId) {
                        const loyalty = u.loyaltyCakes || [false, false, false, false, false, false, false, false, false];
                        const newLoyalty = [...loyalty];
                        newLoyalty[cakeIndex] = !newLoyalty[cakeIndex];
                        return { ...u, loyaltyCakes: newLoyalty };
                    }
                    return u;
                });
                setUsers(updatedUsers);
            }
        } catch (err) {
            console.error('Failed to toggle cake:', err);
        }
    };

    return (
        <div className="admin-overlay">
            <div className="admin-modal">
                <div className="admin-header">
                    <h2 className="serif">Admin Dashboard</h2>
                    <button className="btn-close-admin" onClick={onClose}>×</button>
                </div>

                <div className="admin-content">
                    <div className="admin-stats">
                        <div className="stat-card">
                            <h3>Total Users</h3>
                            <p className="stat-value">{users.length}</p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="admin-loading">Loading users...</p>
                    ) : error ? (
                        <p className="admin-error">{error}</p>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>City</th>
                                        <th>Cakes</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.username || '-'}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>{user.city || '-'}</td>
                                            <td>
                                                <div className="admin-cakes-grid">
                                                    {(user.loyaltyCakes || Array(9).fill(false)).map((isMarked: boolean, index: number) => (
                                                        <span
                                                            key={index}
                                                            className={`admin-cake-icon ${isMarked ? 'active' : ''}`}
                                                            onClick={() => handleCakeToggle(user._id, index)}
                                                            title={`Cake ${index + 1}`}
                                                        >
                                                            🍰
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
