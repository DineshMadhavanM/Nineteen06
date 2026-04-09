import React, { useState } from 'react';
import './Trending.css';
import { menuData } from '../data/menu';
import type { MenuItem } from '../data/menu';
import CustomizationModal from './CustomizationModal';
import { useShopStatus } from '../context/ShopStatusContext';
import { apiUrl } from '../lib/api';

interface TrendingProps {
    onAddToCart: (item: MenuItem, quantity?: number) => void;
    isAdmin?: boolean;
}

const Trending: React.FC<TrendingProps> = ({ onAddToCart, isAdmin }) => {
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { status: shopStatus, refreshStatus } = useShopStatus();
    const outOfStockItems = shopStatus?.outOfStockItems || [];

    const handleStockToggle = async (itemId: string) => {
        try {
            const res = await fetch(apiUrl(`/api/settings/stock/${itemId}`), { method: 'POST' });
            if (res.ok) {
                await refreshStatus();
            }
        } catch (e) {
            console.error("Failed to toggle stock", e);
        }
    };

    // Select a few representative items since trending flag might be missing in new data
    const trendingItems = menuData.slice(0, 3);

    const handleAddClick = (item: MenuItem) => {
        if (item.customizable) {
            setSelectedItem(item);
            setIsModalOpen(true);
        } else {
            onAddToCart(item);
        }
    };

    const handleCustomizationAdd = (item: MenuItem, selectedOptions: { title: string; itemName: string; price: number }[], quantity: number) => {
        const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
        onAddToCart({ 
            ...item, 
            price: item.price + optionsTotal, 
            selectedOptions 
        } as any, quantity);
    };

    return (
        <section id="trending" className="trending section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Customer Favorites</span>
                    <h2 className="title">Trending Desserts</h2>
                    <div className="divider"><span>✨</span></div>
                </div>

                <div className="trending-grid">
                    {trendingItems.map((item) => (
                        <div key={item.id} className="trending-card">
                            <div className="trending-img-wrapper">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="trending-img" />
                                ) : (
                                    <div className="img-placeholder">{item.name[0]}</div>
                                )}
                                <div className="trending-badge">Trending</div>
                            </div>
                            <div className="trending-info">
                                <span className="item-category">{item.category}</span>
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-desc">{item.description}</p>
                                <div className="item-footer">
                                    <span className="item-price">₹{item.price}</span>
                                    {isAdmin ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.8rem' }}>In Stock</span>
                                            <label className="stock-toggle">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!outOfStockItems.includes(item.id)} 
                                                    onChange={() => handleStockToggle(item.id)} 
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    ) : (
                                        outOfStockItems.includes(item.id) 
                                        ? <span className="out-of-stock-text" style={{ color: '#d32f2f', fontWeight: 'bold' }}>Out of Stock</span>
                                        : <button className="btn-add" onClick={() => handleAddClick(item)}>Add to Order</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <CustomizationModal 
                    item={selectedItem}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleCustomizationAdd}
                />
            )}
        </section>
    );
};

export default Trending;
