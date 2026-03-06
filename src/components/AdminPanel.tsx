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

interface Order {
    _id: string;
    items: any[];
    totalAmount: number;
    address: string;
    instructions?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    status: string;
    deliveryTime?: string;
    createdAt: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'orders'>('users');
    const [deliveryTimes, setDeliveryTimes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [usersRes, ordersRes] = await Promise.all([
                fetch('/api/auth/admin/users', { headers: { 'x-auth-token': token || '' } }),
                fetch('/api/orders/admin', { headers: { 'x-auth-token': token || '' } })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (ordersRes.ok) setOrders(await ordersRes.json());
        } catch (err) {
            console.error('Fetch error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId: string) => {
        const dTime = deliveryTimes[orderId];
        if (!dTime) {
            alert('Please specify delivery time');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders/${orderId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ deliveryTime: dTime })
            });

            if (response.ok) {
                fetchData();
                alert('Order confirmed and message sent to customer!');
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders/${orderId}/complete`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token || ''
                }
            });

            if (response.ok) {
                fetchData();
                alert('Order marked as Completed and moved to history!');
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleCakeToggle = async (userId: string, cakeIndex: number) => {
        try {
            const token = localStorage.getItem('token');
            const url = `/api/auth/admin/users/${userId}/loyalty`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ cakeIndex })
            });

            if (response.ok) {
                setUsers(users.map(u => {
                    if (u._id === userId) {
                        const newCakes = [...(u.loyaltyCakes || Array(9).fill(false))];
                        newCakes[cakeIndex] = !newCakes[cakeIndex];
                        return { ...u, loyaltyCakes: newCakes };
                    }
                    return u;
                }));
            }
        } catch (err) {
            console.error('Update failed');
        }
    };

    return (
        <div className="admin-overlay">
            <div className="admin-modal">
                <div className="admin-header">
                    <h2 className="serif">Admin Dashboard</h2>
                    <div className="admin-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders/Messages
                        </button>
                    </div>
                    <button className="btn-close-admin" onClick={onClose}>×</button>
                </div>

                <div className="admin-content">
                    {loading ? (
                        <p>Loading data...</p>
                    ) : activeTab === 'users' ? (
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Joined</th>
                                        <th>Loyalty Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.username || '-'}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="admin-cakes-grid">
                                                    {(user.loyaltyCakes || Array(9).fill(false)).map((isMarked, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`admin-cake-icon ${isMarked ? 'active' : ''}`}
                                                            onClick={() => handleCakeToggle(user._id, idx)}
                                                        >
                                                            🧁
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="orders-container">
                            <h3 className="serif" style={{ marginBottom: '1rem', color: 'var(--chocolate)' }}>Active Orders</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID & Customer</th>
                                        <th>Contact</th>
                                        <th>Details</th>
                                        <th>Status / Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(order => (
                                        <tr key={order._id}>
                                            <td>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--caramel)' }}>#{order._id.slice(-6).toUpperCase()}</span><br />
                                                <strong>{order.customerName}</strong><br />
                                                <span style={{ fontSize: '0.8rem' }}>{order.customerEmail}</span>
                                            </td>
                                            <td>{order.customerPhone || '-'}<br />{order.address}</td>
                                            <td>
                                                <div style={{ fontSize: '0.9rem' }}>
                                                    {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                                                </div>
                                                {order.instructions && <div style={{ color: 'var(--caramel)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Note: {order.instructions}</div>}
                                            </td>
                                            <td>
                                                {order.status === 'Pending' ? (
                                                    <div className="confirm-action" style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Delivery time"
                                                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.8rem', width: '100px' }}
                                                            onChange={(e) => setDeliveryTimes({ ...deliveryTimes, [order._id]: e.target.value })}
                                                        />
                                                        <button
                                                            className="tab-btn active"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                            onClick={() => handleConfirmOrder(order._id)}
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="status-action-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                            {order.status} {order.deliveryTime && `(${order.deliveryTime})`}
                                                        </span>
                                                        <button
                                                            className="btn-complete-order"
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                fontSize: '0.75rem',
                                                                background: '#27ae60',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                            onClick={() => handleCompleteOrder(order._id)}
                                                        >
                                                            Mark as Completed
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3 className="serif" style={{ margin: '2rem 0 1rem', color: 'var(--chocolate)', opacity: 0.6 }}>Order History</h3>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID & Customer</th>
                                            <th>Total</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').map(order => (
                                            <tr key={order._id} style={{ opacity: 0.7 }}>
                                                <td>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--caramel)' }}>#{order._id.slice(-6).toUpperCase()}</span><br />
                                                    {order.customerName}
                                                </td>
                                                <td>₹{order.totalAmount}</td>
                                                <td>
                                                    <div style={{ fontSize: '0.8rem' }}>
                                                        {order.items.map((i) => i.name).join(', ')}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
