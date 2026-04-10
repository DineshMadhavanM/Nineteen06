import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';
import { apiUrl } from '../lib/api';
// Routing Map Imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { menuData } from '../data/menu';
import { useShopStatus } from '../context/ShopStatusContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AdminPanelProps {
    onClose: () => void;
    isAlarmActive: boolean;
    stopAlarm: () => void;
    isAudioAllowed: boolean;
    testAlarm: () => void;
    playAlarm: () => void;
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
    latitude?: number;
    longitude?: number;
    createdAt: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, isAlarmActive, stopAlarm, isAudioAllowed, testAlarm, playAlarm }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'menu'>('users');
    const [deliveryTimes, setDeliveryTimes] = useState<{ [key: string]: string }>({});
    const [mapOrder, setMapOrder] = useState<Order | null>(null);
    const [shopSettings, setShopSettings] = useState<{ manualStatus: string; calculatedStatus: string } | null>(null);
    const [showUnlockBanner, setShowUnlockBanner] = useState(!isAudioAllowed);
    
    // For Menu Management
    const [activeCategory, setActiveCategory] = useState('All');
    const { status: shopStatusLive, refreshStatus } = useShopStatus();
    const categories = ['All', ...new Set(menuData.map(item => item.category))];
    
    const lastPendingOrderIds = useRef<Set<string>>(new Set());
    // Use refs to avoid stale closures inside setInterval
    const playAlarmRef = useRef(playAlarm);
    const isAlarmActiveRef = useRef(isAlarmActive);
    useEffect(() => { playAlarmRef.current = playAlarm; }, [playAlarm]);
    useEffect(() => { isAlarmActiveRef.current = isAlarmActive; }, [isAlarmActive]);

    // Track which order IDs have already triggered the alarm (persists across re-opens in same session)
    const getAlarmedIds = () => {
        try { return new Set(JSON.parse(sessionStorage.getItem('alarmedOrderIds') || '[]')); }
        catch { return new Set<string>(); }
    };
    const markAlarmed = (ids: string[]) => {
        try {
            const existing = getAlarmedIds();
            ids.forEach(id => existing.add(id));
            sessionStorage.setItem('alarmedOrderIds', JSON.stringify([...existing]));
        } catch {}
    };

    // Stop alarm when clicking anywhere in the admin panel
    const handlePanelClick = () => {
        if (isAlarmActive) {
            stopAlarm();
        }
    };

    // Remove a single order ID from the alarmed-IDs list when dealt with
    const clearAlarmedId = (orderId: string) => {
        try {
            const existing = getAlarmedIds();
            existing.delete(orderId);
            sessionStorage.setItem('alarmedOrderIds', JSON.stringify([...existing]));
        } catch {}
    };

    useEffect(() => {
        // Stop alarm as soon as admin panel opens
        stopAlarm();

        fetchData();
        fetchShopSettings();

        // Polling for new orders every 10 seconds
        const pollInterval = setInterval(() => {
            fetchData(true); // true indicates a background poll
        }, 10000);

        return () => clearInterval(pollInterval);
    }, []);

    const fetchShopSettings = async () => {
        try {
            const res = await fetch(apiUrl('/api/settings/status'));
            if (res.ok) setShopSettings(await res.json());
        } catch (err) {
            console.error('Failed to fetch shop settings');
        }
    };

    const fetchData = async (isPoll = false) => {
        if (!isPoll) setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [usersRes, ordersRes] = await Promise.all([
                fetch(apiUrl('/api/auth/admin/users'), { headers: { 'x-auth-token': token || '' } }),
                fetch(apiUrl('/api/orders/admin'), { headers: { 'x-auth-token': token || '' } })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (ordersRes.ok) {
                const fetchedOrders: Order[] = await ordersRes.json();
                
                // --- Alarm Logic ---
                const currentPendingIds = fetchedOrders
                    .filter(o => o.status === 'Pending')
                    .map(o => o._id);
                
                // Find pending orders that have NOT yet triggered the alarm
                const alarmedIds = getAlarmedIds();
                const unalarmedPendingIds = currentPendingIds.filter(id => !alarmedIds.has(id));

                if (unalarmedPendingIds.length > 0 && !isAlarmActiveRef.current) {
                    if (isPoll) {
                        // Immediate on polls
                        console.log('Alarm triggered by polling for new order(s)');
                        playAlarmRef.current();
                    } else {
                        // On first panel open: small delay to let audio context initialize from the tap gesture
                        console.log('Alarm triggered on panel open — pending orders found');
                        setTimeout(() => {
                            if (!isAlarmActiveRef.current) playAlarmRef.current();
                        }, 600);
                    }
                    markAlarmed(unalarmedPendingIds);
                }
                
                // Update tracked IDs
                lastPendingOrderIds.current = new Set(currentPendingIds);
                
                setOrders(fetchedOrders);
            }
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
            const response = await fetch(apiUrl(`/api/orders/${orderId}/confirm`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ deliveryTime: dTime })
            });

            if (response.ok) {
                stopAlarm();
                clearAlarmedId(orderId);
                fetchData();
                alert('Order confirmed and message sent to customer!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Confirm failed (Status: ${response.status}): ` + (errorData.message || response.statusText));
            }
        } catch (err) {
            alert('Confirm request error');
        }
    };

    const handleCompleteOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl(`/api/orders/${orderId}/complete`), {
                method: 'PUT',
                headers: {
                    'x-auth-token': token || ''
                }
            });

            if (response.ok) {
                fetchData();
                alert('Order marked as Completed and moved to history!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                const currentUrl = window.location.origin;
                alert(`Completion failed (Status: ${response.status}):\n` +
                    (errorData.message || response.statusText) +
                    ` \n\nIMPORTANT: You are currently on ${currentUrl}. ` +
                    `If this is NOT your Backend URL, visit your Backend URL to fix this 404.`);
            }
        } catch (err) {
            alert('Completion request error');
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl(`/api/orders/${orderId}`), {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token || ''
                }
            });

            if (response.ok) {
                setOrders(orders.filter(o => o._id !== orderId));
                alert('Order deleted successfully');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Delete failed: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            alert('Delete request error');
        }
    };

    const handleRejectOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to reject this order?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`/api/orders/${orderId}/reject`), {
                method: 'PUT',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) { stopAlarm(); clearAlarmedId(orderId); fetchData(); alert('Order rejected and customer notified.'); }
            else alert('Reject failed');
        } catch (err) { alert('Request error'); }
    };

    const handleReadyOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`/api/orders/${orderId}/ready`), {
                method: 'PUT',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) { fetchData(); alert('Status updated: Order Ready!'); }
            else alert('Update failed');
        } catch (err) { alert('Request error'); }
    };

    const handleReachedOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`/api/orders/${orderId}/reached`), {
                method: 'PUT',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) { fetchData(); alert('Status updated: Reached location!'); }
            else alert('Update failed');
        } catch (err) { alert('Request error'); }
    };

    const handleCakeToggle = async (userId: string, cakeIndex: number) => {
        try {
            const token = localStorage.getItem('token');
            const url = apiUrl(`/api/auth/admin/users/${userId}/loyalty`);
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

    const handleStockToggle = async (itemId: string) => {
        try {
            const res = await fetch(apiUrl(`/api/settings/stock/${itemId}`), { method: 'POST' });
            if (res.ok) {
                await refreshStatus();
                // Also update local shopSettings if we want to stay in sync
                fetchShopSettings();
            }
        } catch (e) {
            console.error("Failed to toggle stock", e);
        }
    };

    const handleToggleShop = async () => {
        if (!shopSettings) return;
        const newStatus = shopSettings.manualStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl('/api/settings/toggle'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                const data = await res.json();
                setShopSettings({ manualStatus: data.manualStatus, calculatedStatus: data.calculatedStatus });
                alert(`Shop is now manually set to ${data.manualStatus}`);
            }
        } catch (err) {
            alert('Failed to toggle shop status');
        }
    };

    return (
        <>
            {/* Audio Unlock Banner — shown once until user interacts */}
            {showUnlockBanner && !isAudioAllowed && (
                <div
                    className="audio-unlock-banner"
                    onClick={() => {
                        testAlarm();
                        setShowUnlockBanner(false);
                    }}
                >
                    🔔 Tap here to enable order alarm audio
                </div>
            )}
            <div className="admin-overlay" onClick={handlePanelClick}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 className="serif">Admin Dashboard</h2>
                        
                        <div className="admin-audio-controls">
                            <span className={`audio-status-tag ${isAudioAllowed ? 'unlocked' : 'locked'}`}>
                                {isAudioAllowed ? '🔊 Audio ON' : '🔇 Audio Locked'}
                            </span>
                            <button className="btn-test-sound" onClick={testAlarm}>
                                🔊 Test Alarm
                            </button>
                        </div>

                        {isAlarmActive && (
                            <div className="alarm-banner" onClick={stopAlarm}>
                                🔔 NEW ORDER! <button className="btn-stop-alarm">STOP ALARM</button>
                            </div>
                        )}
                    </div>
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
                        <button
                            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                            onClick={() => setActiveTab('menu')}
                        >
                            Menu Management
                        </button>
                    </div>

                    <div className="shop-control-admin">
                        <span className="shop-admin-label">Shop Status: </span>
                        <div className={`status-preview ${shopSettings?.calculatedStatus.toLowerCase()}`}>
                            {shopSettings?.calculatedStatus || '...'}
                        </div>
                        <button 
                            className={`btn-shop-toggle ${shopSettings?.manualStatus === 'OPEN' ? 'open' : 'closed'}`}
                            onClick={handleToggleShop}
                        >
                            {shopSettings?.manualStatus === 'OPEN' ? '🟢 OPEN' : '🔴 CLOSED'}
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
                                            <td data-label="Name">{user.username || '-'}</td>
                                            <td data-label="Email">{user.email}</td>
                                            <td data-label="Phone">{user.phone || '-'}</td>
                                            <td data-label="Joined">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td data-label="Loyalty Progress">
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
                    ) : activeTab === 'orders' ? (
                        <div className="orders-container">
                            <h3 className="serif" style={{ marginBottom: '1rem', color: 'var(--chocolate)' }}>Active Orders</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID & Customer</th>
                                        <th>Contact</th>
                                        <th>Total</th>
                                        <th>Details</th>
                                        <th>Status / Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(order => (
                                        <tr key={order._id}>
                                            <td data-label="ID & Name">
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--caramel)' }}>#{order._id.slice(-6).toUpperCase()}</span><br />
                                                <strong>{order.customerName}</strong><br />
                                                <span style={{ fontSize: '0.8rem' }}>{order.customerEmail}</span>
                                            </td>
                                            <td data-label="Contact">
                                                <span style={{ fontWeight: '600' }}>{order.customerPhone || '-'}</span><br />
                                                <span style={{ fontSize: '0.85rem' }}>{order.address}</span>
                                            </td>
                                            <td data-label="Total">
                                                <strong style={{ fontSize: '1.1rem', color: 'var(--chocolate)' }}>₹{order.totalAmount}</strong>
                                            </td>
                                            <td data-label="Details">
                                                <div style={{ fontSize: '0.9rem', color: 'var(--chocolate)' }}>
                                                    {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                                                </div>
                                                {order.instructions && <div style={{ color: 'var(--caramel)', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: '500' }}>Note: {order.instructions}</div>}
                                            </td>
                                            <td data-label="Status / Action">
                                                {order.status === 'Pending' ? (
                                                    <div className="confirm-action" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {order.latitude && (
                                                            <button className="tab-btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', background: 'var(--pistachio)' }} onClick={() => setMapOrder(order)}>📍 Route</button>
                                                        )}
                                                        <button 
                                                            className="tab-btn" 
                                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#ff4d4d', color: 'white', border: 'none' }} 
                                                            onClick={() => handleRejectOrder(order._id)}
                                                        >
                                                            Reject
                                                        </button>
                                                        <input
                                                            type="time"
                                                            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem', width: '100px' }}
                                                            onChange={(e) => setDeliveryTimes({ ...deliveryTimes, [order._id]: e.target.value })}
                                                        />
                                                        <button className="tab-btn active" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleConfirmOrder(order._id)}>
                                                            Confirm
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="status-action-cell" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                                {order.status} {order.deliveryTime && `(${order.deliveryTime})`}
                                                            </span>
                                                            {order.latitude && (
                                                                <button className="tab-btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', background: 'var(--pistachio)' }} onClick={() => setMapOrder(order)}>📍 Route</button>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Sequential Action Buttons based on Status */}
                                                        {order.status === 'Confirmed' && (
                                                            <button className="btn-complete-order" style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleReadyOrder(order._id)}>
                                                                📦 Order Ready
                                                            </button>
                                                        )}
                                                        {order.status === 'Ready' && (
                                                            <button className="btn-complete-order" style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleReachedOrder(order._id)}>
                                                                📍 Reached
                                                            </button>
                                                        )}
                                                        {order.status === 'Reached' && (
                                                            <button className="btn-complete-order" style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleCompleteOrder(order._id)}>
                                                                ✅ Mark as Completed
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3 className="serif" style={{ margin: '2rem 0 1rem', color: 'var(--chocolate)' }}>Order History</h3>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID & Name</th>
                                            <th>Contact</th>
                                            <th>Total</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').map(order => (
                                            <tr key={order._id}>
                                                <td data-label="ID & Name">
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--caramel)', fontWeight: 'bold' }}>#{order._id.slice(-6).toUpperCase()}</span><br />
                                                    <strong>{order.customerName}</strong>
                                                </td>
                                                <td data-label="Contact">
                                                    <span style={{ fontSize: '0.85rem' }}>{order.customerPhone || '-'}</span><br />
                                                    <span style={{ fontSize: '0.8rem' }}>{order.address}</span>
                                                </td>
                                                <td data-label="Total">₹{order.totalAmount}</td>
                                                <td data-label="Details">
                                                    <div style={{ fontSize: '0.8rem' }}>
                                                        {order.items.map((i) => i.name).join(', ')}
                                                    </div>
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td data-label="Actions">
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        {order.latitude && (
                                                            <button
                                                                className="tab-btn"
                                                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem', background: 'var(--pistachio)' }}
                                                                onClick={() => setMapOrder(order)}
                                                            >
                                                                📍 Route
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn-delete-order"
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                fontSize: '0.75rem',
                                                                background: '#e74c3c',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold'
                                                            }}
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-menu-management">
                            <div className="admin-category-tabs">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`admin-cat-bubble ${activeCategory === cat ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuData
                                            .filter(item => activeCategory === 'All' || item.category === activeCategory)
                                            .map(item => (
                                                <tr key={item.id}>
                                                    <td data-label="Item Name">
                                                        <strong>{item.name}</strong>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.id}</div>
                                                    </td>
                                                    <td data-label="Category">{item.category}</td>
                                                    <td data-label="Price">₹{item.price}</td>
                                                    <td data-label="Stock Status">
                                                        <label className="admin-stock-switch">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!shopStatusLive?.outOfStockItems?.includes(item.id)} 
                                                                onChange={() => handleStockToggle(item.id)}
                                                            />
                                                            <span className="stock-slider round"></span>
                                                        </label>
                                                        <span style={{ marginLeft: '0.8rem', fontSize: '0.85rem', fontWeight: 600, color: shopStatusLive?.outOfStockItems?.includes(item.id) ? '#e74c3c' : '#27ae60' }}>
                                                            {shopStatusLive?.outOfStockItems?.includes(item.id) ? 'OUT OF STOCK' : 'IN STOCK'}
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

            {mapOrder && (
                <div className="map-modal-overlay" onClick={() => setMapOrder(null)}>
                    <div className="map-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="map-modal-header">
                            <h3>Delivery Route: {mapOrder.customerName}</h3>
                            <button onClick={() => setMapOrder(null)}>×</button>
                        </div>
                        <div className="map-modal-body">
                            <AdminRouteMap 
                                customerLocation={[mapOrder.latitude!, mapOrder.longitude!]} 
                            />
                        </div>
                        <div className="map-modal-footer">
                            <p><strong>Address:</strong> {mapOrder.address}</p>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

// --- Sub-component for the Routing Map ---

const BAKERY_LOCATION: [number, number] = [10.0101, 77.4770];

const AdminRouteMap = ({ customerLocation }: { customerLocation: [number, number] }) => {
    const [fromLocation, setFromLocation] = useState<[number, number] | null>(null);
    const [locating, setLocating] = useState(true);
    const [usingLiveGps, setUsingLiveGps] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setFromLocation(BAKERY_LOCATION);
            setLocating(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setFromLocation([pos.coords.latitude, pos.coords.longitude]);
                setUsingLiveGps(true);
                setLocating(false);
            },
            () => {
                // Permission denied or unavailable — fall back to bakery address
                if (locating) {
                    setFromLocation(BAKERY_LOCATION);
                    setUsingLiveGps(false);
                    setLocating(false);
                }
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );

        // Cleanup the GPS watcher when the map is closed to save battery
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (locating) {
        return (
            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--chocolate)' }}>
                <div style={{ fontSize: '2rem' }}>📍</div>
                <p style={{ fontWeight: '600' }}>Getting your location…</p>
                <p style={{ fontSize: '0.8rem', color: '#888' }}>Allow location access for live routing</p>
            </div>
        );
    }

    return (
        <>
            <div style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', marginBottom: '0.4rem', background: usingLiveGps ? '#e8f5e9' : '#fff8e1', borderRadius: '6px', color: usingLiveGps ? '#2e7d32' : '#f57f17', fontWeight: '600' }}>
                {usingLiveGps ? '📡 Using your live GPS location as start point' : '🧁 Using bakery address as start point (location access denied)'}
            </div>
            <MapContainer center={fromLocation!} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={fromLocation!}>
                    <Popup>{usingLiveGps ? '📍 Your Current Location' : '🧁 NINETEEN 06 Bakery\n106, Edamal Street, Theni'}</Popup>
                </Marker>
                <Marker position={customerLocation}>
                    <Popup>📦 Customer Location</Popup>
                </Marker>
                <RoutingMachine from={fromLocation!} to={customerLocation} />
            </MapContainer>
        </>
    );
};

// Functional routing component checking the backend proxy instead of LRM
const RoutingMachine = ({ from, to }: { from: [number, number], to: [number, number] }) => {
    const map = useMap();
    const [routePath, setRoutePath] = useState<[number, number][]>([]);

    useEffect(() => {
        if (!from || !to) return;

        const fetchRoute = async () => {
            try {
                // Fetch from our backend proxy
                const res = await fetch(
                    apiUrl(`/api/geocode/route?startLat=${from[0]}&startLon=${from[1]}&endLat=${to[0]}&endLon=${to[1]}`)
                );
                const data = await res.json();
                
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates;
                    // GeoJSON format is [lon, lat], Leaflet polyline expects [lat, lon]
                    const latLngs: [number, number][] = coords.map((c: any) => [c[1], c[0]]);
                    setRoutePath(latLngs);

                    // Fit map bounds to show the whole route
                    if (latLngs.length > 0 && map) {
                        const bounds = L.latLngBounds(latLngs);
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }
                }
            } catch (err) {
                console.error('Error fetching route from backend proxy:', err);
            }
        };

        fetchRoute();
    }, [from, to, map]);

    if (routePath.length === 0) return null;

    return (
        <Polyline 
            positions={routePath} 
            pathOptions={{ color: '#f39c12', weight: 6, opacity: 0.8 }} 
        />
    );
};
