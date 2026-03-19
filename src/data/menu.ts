export interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image?: string;
    trending?: boolean;
    customizable?: boolean;
    customizations?: {
        title: string;
        options: string[]; // IDs of other menu items
        required?: boolean;
    }[];
}

export interface CartItem extends MenuItem {
    quantity: number;
    selectedOptions?: { title: string; itemName: string; price: number }[];
}

const defaultCustomizations = [
    { title: 'Choose your snacks', options: ['s1', 's2', 's3'], required: false },
    { title: 'Choose your refreshing spl', options: ['rs1', 'rs2'], required: false },
    { title: 'Choose your mojito', options: ['mj1', 'mj2', 'mj3'], required: false }
];

export const menuData: MenuItem[] = [
    // Brownie
    { id: 'b1', name: 'Classic fudge brownie', category: 'Brownie', price: 49, description: 'Baked in small batches. Served with warmth.', customizable: true, customizations: defaultCustomizations },
    { id: 'b2', name: 'Double chocolate brownie', category: 'Brownie', price: 65, description: 'Baked in small batches. Served with warmth.', customizable: true, customizations: defaultCustomizations },
    { id: 'b3', name: 'Triple chocolate brownie', category: 'Brownie', price: 69, description: 'Baked in small batches. Served with warmth.', customizable: true, customizations: defaultCustomizations },
    { id: 'b4', name: 'Hot chocolate brownie', category: 'Brownie', price: 79, description: 'Baked in small batches. Served with warmth.', customizable: true, customizations: defaultCustomizations },
    { id: 'b5', name: 'Nutella brownie', category: 'Brownie', price: 99, description: 'Baked in small batches. Served with warmth.', customizable: true, customizations: defaultCustomizations },
    { id: 'b6', name: 'Brownie Bites (1pcs)', category: 'Brownie', price: 15, description: '3pcs: ₹40 | 5code: ₹60', customizable: true, customizations: defaultCustomizations },

    // Tres Leches
    { id: 't1-h', name: 'Milk cake (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't1-f', name: 'Milk cake (FULL)', category: 'Tres Leches', price: 69, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't2-h', name: 'Turkish Milk cake (HALF)', category: 'Tres Leches', price: 49, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't2-f', name: 'Turkish Milk cake (FULL)', category: 'Tres Leches', price: 89, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't3-h', name: 'Rosemilk Tres Leches (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't3-f', name: 'Rosemilk Tres Leches (FULL)', category: 'Tres Leches', price: 75, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't4-h', name: 'Mocha Tres Leches (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't4-f', name: 'Mocha Tres Leches (FULL)', category: 'Tres Leches', price: 79, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't5-h', name: 'Rasamalai Tres Leches (HALF)', category: 'Tres Leches', price: 49, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 't5-f', name: 'Rasamalai Tres Leches (FULL)', category: 'Tres Leches', price: 89, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },

    // Cookies
    { id: 'c1', name: 'Chocochip cookies', category: 'Cookies', price: 10, description: 'Baked in small batches.', customizable: true, customizations: defaultCustomizations },
    { id: 'c2', name: 'Chocolate cookies', category: 'Cookies', price: 15, description: 'Baked in small batches.', customizable: true, customizations: defaultCustomizations },

    // Muffins
    { id: 'm1', name: 'Chocolate muffins', category: 'Muffins', price: 20, description: 'Baked in small batches.', customizable: true, customizations: defaultCustomizations },
    { id: 'm2', name: 'Banana chocochip muffins', category: 'Muffins', price: 25, description: 'Baked in small batches.', customizable: true, customizations: defaultCustomizations },

    // Jar cake
    { id: 'j1', name: 'Vannilla caramel jar cake', category: 'Jar cake', price: 70, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 'j2', name: 'Black forest jar cake', category: 'Jar cake', price: 70, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 'j3', name: 'Red velvet jar cake', category: 'Jar cake', price: 80, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },

    // Panna cotta
    { id: 'p1', name: 'Strawberry Panna cotta', category: 'Panna cotta', price: 75, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 'p2', name: 'Blueberry Panna cotta', category: 'Panna cotta', price: 80, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },

    // Mousse
    { id: 'mo1', name: 'Oreo mousse', category: 'Mousse', price: 75, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },
    { id: 'mo2', name: 'Kit kat mousse', category: 'Mousse', price: 80, description: 'Freshly made • Made with love', customizable: true, customizations: defaultCustomizations },

    // Refreshing spl
    { id: 'rs1', name: 'Arabian grapes pulp', category: 'Refreshing spl', price: 50, description: 'Freshly made • Made with love' },
    { id: 'rs2', name: 'Elaneer payasam', category: 'Refreshing spl', price: 90, description: 'Freshly made • Made with love' },

    // Mojito
    { id: 'mj1', name: 'Virgin mojito', category: 'Mojito', price: 65, description: 'Freshly made • Made with love' },
    { id: 'mj2', name: 'Blue curacao mojito', category: 'Mojito', price: 70, description: 'Freshly made • Made with love' },
    { id: 'mj3', name: 'Watermelon mojito', category: 'Mojito', price: 75, description: 'Freshly made • Made with love' },

    // Snacks
    { id: 's1', name: 'Garlic bread', category: 'Snacks', price: 25, description: 'Freshly made • Made with love' },
    { id: 's2', name: 'French Toast', category: 'Snacks', price: 40, description: 'Freshly made • Made with love' },
    { id: 's3', name: 'Bread omelet', category: 'Snacks', price: 50, description: 'Freshly made • Made with love' },
];

