export interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image?: string;
    trending?: boolean;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export const menuData: MenuItem[] = [
    // Brownie
    { id: 'b1', name: 'Classic fudge brownie', category: 'Brownie', price: 49, description: 'Baked in small batches. Served with warmth.' },
    { id: 'b2', name: 'Double chocolate brownie', category: 'Brownie', price: 65, description: 'Baked in small batches. Served with warmth.' },
    { id: 'b3', name: 'Triple chocolate brownie', category: 'Brownie', price: 69, description: 'Baked in small batches. Served with warmth.' },
    { id: 'b4', name: 'Hot chocolate brownie', category: 'Brownie', price: 79, description: 'Baked in small batches. Served with warmth.' },
    { id: 'b5', name: 'Nutella brownie', category: 'Brownie', price: 99, description: 'Baked in small batches. Served with warmth.' },
    { id: 'b6', name: 'Brownie Bites (1pcs)', category: 'Brownie', price: 15, description: '3pcs: ₹40 | 5code: ₹60' },

    // Tres Leches
    { id: 't1-h', name: 'Milk cake (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love' },
    { id: 't1-f', name: 'Milk cake (FULL)', category: 'Tres Leches', price: 69, description: 'Freshly made • Made with love' },
    { id: 't2-h', name: 'Turkish Milk cake (HALF)', category: 'Tres Leches', price: 49, description: 'Freshly made • Made with love' },
    { id: 't2-f', name: 'Turkish Milk cake (FULL)', category: 'Tres Leches', price: 89, description: 'Freshly made • Made with love' },
    { id: 't3-h', name: 'Rosemilk Tres Leches (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love' },
    { id: 't3-f', name: 'Rosemilk Tres Leches (FULL)', category: 'Tres Leches', price: 75, description: 'Freshly made • Made with love' },
    { id: 't4-h', name: 'Mocha Tres Leches (HALF)', category: 'Tres Leches', price: 39, description: 'Freshly made • Made with love' },
    { id: 't4-f', name: 'Mocha Tres Leches (FULL)', category: 'Tres Leches', price: 79, description: 'Freshly made • Made with love' },
    { id: 't5-h', name: 'Rasamalai Tres Leches (HALF)', category: 'Tres Leches', price: 49, description: 'Freshly made • Made with love' },
    { id: 't5-f', name: 'Rasamalai Tres Leches (FULL)', category: 'Tres Leches', price: 89, description: 'Freshly made • Made with love' },

    // Cookies
    { id: 'c1', name: 'Chocochip cookies', category: 'Cookies', price: 10, description: 'Baked in small batches.' },
    { id: 'c2', name: 'Chocolate cookies', category: 'Cookies', price: 15, description: 'Baked in small batches.' },

    // Muffins
    { id: 'm1', name: 'Chocolate muffins', category: 'Muffins', price: 20, description: 'Baked in small batches.' },
    { id: 'm2', name: 'Banana chocochip muffins', category: 'Muffins', price: 25, description: 'Baked in small batches.' },

    // Jar cake
    { id: 'j1', name: 'Vannilla caramel jar cake', category: 'Jar cake', price: 70, description: 'Freshly made • Made with love' },
    { id: 'j2', name: 'Black forest jar cake', category: 'Jar cake', price: 70, description: 'Freshly made • Made with love' },
    { id: 'j3', name: 'Red velvet jar cake', category: 'Jar cake', price: 80, description: 'Freshly made • Made with love' },

    // Panna cotta
    { id: 'p1', name: 'Strawberry Panna cotta', category: 'Panna cotta', price: 75, description: 'Freshly made • Made with love' },
    { id: 'p2', name: 'Blueberry Panna cotta', category: 'Panna cotta', price: 80, description: 'Freshly made • Made with love' },

    // Mousse
    { id: 'mo1', name: 'Oreo mousse', category: 'Mousse', price: 75, description: 'Freshly made • Made with love' },
    { id: 'mo2', name: 'Kit kat mousse', category: 'Mousse', price: 80, description: 'Freshly made • Made with love' },

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

