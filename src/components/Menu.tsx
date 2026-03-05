import React, { useState } from 'react';
import './Menu.css';
import { menuData } from '../data/menu';
import type { MenuItem } from '../data/menu';

interface MenuProps {
    onAddToCart: (item: MenuItem) => void;
}

const Menu: React.FC<MenuProps> = ({ onAddToCart }) => {
    const categories = ['All', ...new Set(menuData.map(item => item.category))];
    const [activeCategory, setActiveCategory] = useState('All');

    // Group items by category for the "All" view
    const groupedItems = menuData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const activeCategories = activeCategory === 'All'
        ? Object.keys(groupedItems)
        : [activeCategory];

    return (
        <section id="menu" className="menu section-padding">
            <div className="container">
                <div className="category-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="menu-container">
                    <div className="menu-sections">
                        {activeCategories.map(category => (
                            <div key={category} className="menu-category-section">
                                <div className="category-header">
                                    <div className="category-decoration">☙ ❦ ❧</div>
                                    <h3 className="serif">{category}</h3>
                                    <div className="category-decoration">☫ ☬ ☫</div>
                                </div>
                                <div className="menu-items-list">
                                    {(groupedItems[category] || []).map(item => (
                                        <div key={item.id} className="menu-item-wrapper">
                                            <div className="menu-item-row">
                                                <span className="item-name">{item.name}</span>
                                                <span className="dotted-line"></span>
                                                <span className="item-price">₹{item.price}</span>
                                                <button className="add-btn-mini" onClick={() => onAddToCart(item)}>+</button>
                                            </div>
                                            <p className="item-desc">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="menu-footer-notes">
                        <p>“Prepared fresh upon order. Kindly allow 10 minutes.”</p>
                        <p>“Takeaway orders are subject to ₹10 packaging charge.”</p>
                        <p>“WE ARE ALSO UNDERTAKE PARTY ORDER”</p>
                        <div className="swiggy-zomato">
                            <span>“WE ARE ALSO AVAILABLE ON</span>
                            <span className="badge" style={{ background: '#ff5200', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Swiggy</span>
                            <span className="badge" style={{ background: '#cb202d', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Zomato</span>
                            <span>”</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Menu;
