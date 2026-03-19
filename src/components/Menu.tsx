import React, { useState } from 'react';
import './Menu.css';
import { menuData } from '../data/menu';
import type { MenuItem } from '../data/menu';
import CustomizationModal from './CustomizationModal';

interface MenuProps {
    onAddToCart: (item: MenuItem, quantity?: number) => void;
}

const Menu: React.FC<MenuProps> = ({ onAddToCart }) => {
    const categories = ['All', ...new Set(menuData.map(item => item.category))];
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Group items by category for the "All" view
    const groupedItems = menuData.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const activeCategories = activeCategory === 'All'
        ? Object.keys(groupedItems)
        : [activeCategory];

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
                                    {(groupedItems[category] || []).map(item => {
                                        return (
                                            <div key={item.id} className="menu-item-wrapper">
                                                <div className="menu-item-row">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="dotted-line"></span>
                                                    <span className="item-price">₹{item.price}</span>

                                                    {!['Snacks', 'Refreshing spl', 'Mojito'].includes(item.category) && (
                                                        <button className="add-btn-mini" onClick={() => handleAddClick(item)}>+</button>
                                                    )}
                                                </div>
                                                <p className="item-desc">{item.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="menu-footer-notes">
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

export default Menu;
