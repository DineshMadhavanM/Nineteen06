import React, { useState, useEffect } from 'react';
import './CustomizationModal.css';
import { menuData } from '../data/menu';
import type { MenuItem } from '../data/menu';

interface CustomizationModalProps {
    item: MenuItem;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: MenuItem, selectedOptions: { title: string; itemName: string; price: number }[], quantity: number) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, isOpen, onClose, onAdd }) => {
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setSelections({});
            setQuantity(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOptionSelect = (title: string, optionId: string) => {
        setSelections((prev) => {
            const currentSelected = prev[title] || [];
            if (currentSelected.includes(optionId)) {
                // Deselect if already selected
                return { ...prev, [title]: currentSelected.filter(id => id !== optionId) };
            } else {
                // Select and add to the array
                return { ...prev, [title]: [...currentSelected, optionId] };
            }
        });
    };

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => {
        if (quantity === 1) {
            onClose();
        } else {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        const selectedOptions: { title: string; itemName: string; price: number }[] = [];
        
        item.customizations?.forEach(group => {
            const selectedIds = selections[group.title] || [];
            selectedIds.forEach(optionId => {
                const optionItem = menuData.find(m => m.id === optionId);
                if (optionItem) {
                    selectedOptions.push({
                        title: group.title,
                        itemName: optionItem.name,
                        price: optionItem.price
                    });
                }
            });
        });

        onAdd(item, selectedOptions, quantity);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="customization-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="item-meta">
                        <span className="item-name-small">{item.name} • ₹{item.price}</span>
                        <h2 className="modal-title">Customise as per your taste</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-content">
                    {item.customizations?.map(group => (
                        <div key={group.title} className="option-group">
                            <h3 className="group-title">
                                {group.title} {group.required ? '' : '(optional)'}
                            </h3>
                            <div className="options-list">
                                {group.options.map(optionId => {
                                    const optionItem = menuData.find(m => m.id === optionId);
                                    if (!optionItem) return null;
                                    const isSelected = (selections[group.title] || []).includes(optionId);

                                    return (
                                        <div 
                                            key={optionId} 
                                            className={`option-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleOptionSelect(group.title, optionId)}
                                        >
                                            <div className="option-info">
                                                <span className="dot-indicator"></span>
                                                <span className="option-name">{optionItem.name}</span>
                                                <span className="option-price">+ ₹{optionItem.price}</span>
                                            </div>
                                            <div className="checkbox-wrapper">
                                                <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                                                    {isSelected && <span className="check-mark">✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <div className="quantity-selector">
                        <button className="q-btn" onClick={handleDecrement}>−</button>
                        <span className="q-val">{quantity}</span>
                        <button className="q-btn" onClick={handleIncrement}>+</button>
                    </div>
                    <div className="total-price">
                        ₹{(item.price + Object.values(selections).flat().reduce((acc: number, id: string) => {
                            const opt = menuData.find(m => m.id === id);
                            return acc + (opt?.price || 0);
                        }, 0)) * quantity}
                    </div>
                    <button 
                        className="add-to-cart-btn ready"
                        onClick={handleAddToCart}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
