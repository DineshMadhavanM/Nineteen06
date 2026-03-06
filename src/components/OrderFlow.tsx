import React, { useState, useEffect } from 'react';
import './OrderFlow.css';
import type { CartItem } from '../data/menu';

interface OrderFlowProps {
    cart: CartItem[];
    onClose: () => void;
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
    onClear: () => void;
    onLoginClick: () => void;
    isLoggedIn: boolean;
}

type OrderStatus = 'Idle' | 'Order Placed' | 'Confirmed' | 'Preparing' | 'Ready' | 'Completed';

export const OrderFlow: React.FC<OrderFlowProps> = ({ cart, onClose, onRemove, onUpdateQuantity, onClear, onLoginClick, isLoggedIn }) => {
    const [status, setStatus] = useState<OrderStatus>('Idle');
    const [preparationTime, setPreparationTime] = useState(10);
    const [orderType, setOrderType] = useState<'Now' | 'Pre-Order'>('Now');
    const [preOrderTime, setPreOrderTime] = useState<'30m' | '1h'>('30m');
    const [address, setAddress] = useState('');
    const [instructions, setInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<any>(null);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const packagingCharge = (cart.length > 0 && orderType === 'Now') ? 10 : 0;
    const total = subtotal + packagingCharge;

    const handlePlaceOrder = async () => {
        if (!isLoggedIn) {
            if (window.confirm('You need to log in or join us to place an order. Continue to Login?')) {
                onLoginClick();
            }
            return;
        }

        if (orderType === 'Now' && !address.trim()) {
            alert('Please enter a delivery address');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    items: cart,
                    totalAmount: total,
                    address: orderType === 'Now' ? address : 'Self-Pickup',
                    instructions
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPlacedOrder(data);
                setStatus('Order Placed');
                onClear();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to place order. Please log in.');
            }
        } catch (err) {
            alert('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (status === 'Preparing') {
            const timer = setInterval(() => {
                setPreparationTime(prev => Math.max(0, prev - 1));
            }, 60000);
            return () => clearInterval(timer);
        }
    }, [status]);

    return (
        <div className="order-overlay">
            <div className="order-sidebar">
                <div className="order-header">
                    <h2 className="serif">Your Order</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                {status === 'Idle' ? (
                    <>
                        <div className="order-content-scrollable">
                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div className="empty-cart">
                                        <span className="empty-icon">🧺</span>
                                        <p>Your cart is empty</p>
                                        <button className="btn-primary-sm" onClick={onClose}>Browse Menu</button>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p>₹{item.price}</p>
                                            </div>
                                            <div className="item-actions">
                                                <div className="quantity-controls">
                                                    <button onClick={() => onUpdateQuantity(item.id, -1)}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                                                </div>
                                                <button className="btn-remove" onClick={() => onRemove(item.id)}>Remove</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="order-options">
                                    <h4 className="option-title">How would you like to receive?</h4>
                                    <div className="type-toggle">
                                        <button
                                            className={orderType === 'Now' ? 'active' : ''}
                                            onClick={() => setOrderType('Now')}
                                        >
                                            Order Now (Delivery)
                                        </button>
                                        <button
                                            className={orderType === 'Pre-Order' ? 'active' : ''}
                                            onClick={() => setOrderType('Pre-Order')}
                                        >
                                            Pre-order Pickup
                                        </button>
                                    </div>

                                    {orderType === 'Pre-Order' && (
                                        <div className="time-selector">
                                            <span>Pick up in:</span>
                                            <div className="time-btns">
                                                <button
                                                    className={preOrderTime === '30m' ? 'active' : ''}
                                                    onClick={() => setPreOrderTime('30m')}
                                                >
                                                    30 Mins
                                                </button>
                                                <button
                                                    className={preOrderTime === '1h' ? 'active' : ''}
                                                    onClick={() => setPreOrderTime('1h')}
                                                >
                                                    1 Hour
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="order-details-form">
                                        <div className="form-group">
                                            <label>
                                                <span className="label-icon">📍</span> Delivery Address
                                                {orderType === 'Now' && <span className="required">*</span>}
                                            </label>
                                            <textarea
                                                placeholder={orderType === 'Now' ? "Enter your full address" : "N/A for pickup"}
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                disabled={orderType !== 'Now'}
                                                className="premium-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>
                                                <span className="label-icon">📝</span> Special Instructions (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Example: Extra cream, Zero egg, etc."
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Packaging Charge</span>
                                    <span>₹{packagingCharge}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                                <button
                                    className="btn-checkout"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Order Now'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="order-status-view">
                        <div className="status-animation">
                            <div className={`status-icon ${status.toLowerCase().replace(/ /g, '-')}`}>
                                {status === 'Order Placed' && '📝'}
                                {status === 'Confirmed' && '⏳'}
                                {status === 'Preparing' && '👨‍🍳'}
                                {status === 'Ready' && '🛍️'}
                                {status === 'Completed' && '✅'}
                            </div>
                        </div>
                        <h3 className="status-title">{status}</h3>
                        {placedOrder && (
                            <div className="order-id-badge" style={{ background: 'rgba(47, 30, 27, 0.05)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, margin: '1rem 0', color: 'var(--caramel)' }}>
                                Order ID: #{placedOrder._id.slice(-6).toUpperCase()}
                            </div>
                        )}
                        <p className="status-desc">
                            {status === 'Order Placed' && 'The bakery has received your order. Waiting for admin confirmation.'}
                            {status === 'Confirmed' && (
                                placedOrder?.deliveryTime
                                    ? `Confirmed! Estimated delivery: ${placedOrder.deliveryTime}`
                                    : 'Confirmed by admin! Estimated time coming soon.'
                            )}
                            {status === 'Preparing' && (
                                orderType === 'Pre-Order'
                                    ? `We're crafting your pre-order. It will be ready for pickup in approx ${preOrderTime === '30m' ? '30' : '60'} mins.`
                                    : `We're crafting your dessert with love. Approx ${preparationTime} mins remaining.`
                            )}
                            {status === 'Ready' && 'Fresh and hot! Please collect your order from the counter.'}
                            {status === 'Completed' && 'Thank you for choosing NINETEEN 06! Enjoy your treat.'}
                        </p>

                        <div className="status-steps">
                            <div className="step done">Placed</div>
                            <div className={`step ${['Confirmed', 'Preparing', 'Ready', 'Completed'].includes(status) ? 'done' : ''} ${status === 'Confirmed' ? 'active' : ''}`}>Confirmed</div>
                            <div className={`step ${['Preparing', 'Ready', 'Completed'].includes(status) ? 'done' : ''} ${status === 'Preparing' ? 'active' : ''}`}>Preparing</div>
                            <div className={`step ${['Ready', 'Completed'].includes(status) ? 'done' : ''} ${status === 'Ready' ? 'active' : ''}`}>Ready</div>
                        </div>

                        <button className="btn-close-status" onClick={onClose}>Keep Browsing</button>
                    </div>
                )}
            </div>
        </div>
    );
};
