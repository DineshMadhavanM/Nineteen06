import React from 'react';
import './Trending.css';
import { menuData } from '../data/menu';
import type { MenuItem } from '../data/menu';

interface TrendingProps {
    onAddToCart: (item: MenuItem) => void;
}

const Trending: React.FC<TrendingProps> = ({ onAddToCart }) => {
    // Select a few representative items since trending flag might be missing in new data
    const trendingItems = menuData.slice(0, 3);

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
                                    <button className="btn-add" onClick={() => onAddToCart(item)}>Add to Order</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Trending;
