import React, { useState, useEffect } from 'react';
import './MessageCenter.css';

interface MessageCenterProps {
    onClose: () => void;
}

interface Order {
    _id: string;
    items: any[];
    totalAmount: number;
    status: string;
    deliveryTime?: string;
    createdAt: string;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({ onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/orders/me', {
                    headers: { 'x-auth-token': token || '' }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error('Failed to fetch orders', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="message-overlay">
            <div className="message-modal">
                <div className="message-header">
                    <h2 className="serif">Notifications</h2>
                    <button className="btn-close-msg" onClick={onClose}>×</button>
                </div>

                <div className="message-content">
                    {loading ? (
                        <p className="loading-msg">Loading messages...</p>
                    ) : orders.length === 0 ? (
                        <div className="no-messages">
                            <span className="msg-icon">📬</span>
                            <p>No new messages or orders yet.</p>
                        </div>
                    ) : (
                        <div className="order-list">
                            {orders.some(o => o.status !== 'Completed' && o.status !== 'Cancelled') && (
                                <h3 className="serif" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--chocolate)' }}>Active Orders</h3>
                            )}
                            {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(order => (
                                <div key={order._id} className={`order-card status-${order.status.toLowerCase()}`}>
                                    <div className="order-card-header">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--caramel)' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="order-status-badge">{order.status}</span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <span key={idx}>{item.name} x {item.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                    <div className="order-total">Total: ₹{order.totalAmount}</div>

                                    {order.status === 'Confirmed' && order.deliveryTime && (
                                        <div className="admin-response">
                                            <span className="response-label">Admin Response:</span>
                                            <p className="delivery-info">Deliver in <strong>{order.deliveryTime}</strong></p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {orders.some(o => o.status === 'Completed' || o.status === 'Cancelled') && (
                                <h3 className="serif" style={{ fontSize: '1.1rem', margin: '2rem 0 1rem', color: 'var(--chocolate)', opacity: 0.6 }}>Order History</h3>
                            )}
                            {orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').map(order => (
                                <div key={order._id} className={`order-card status-${order.status.toLowerCase()}`} style={{ opacity: 0.8 }}>
                                    <div className="order-card-header">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--caramel)' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="order-date" style={{ fontSize: '0.75rem' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="order-status-badge" style={{ fontSize: '0.65rem' }}>{order.status}</span>
                                    </div>
                                    <div className="order-items" style={{ fontSize: '0.85rem' }}>
                                        {order.items.map((item, idx) => (
                                            <span key={idx}>{item.name} x {item.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                    <div className="order-total" style={{ fontSize: '0.9rem' }}>Total: ₹{order.totalAmount}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
