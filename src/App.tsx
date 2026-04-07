import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trending from './components/Trending';
import Menu from './components/Menu';
import WhyChooseUs from './components/WhyChooseUs';
import AboutUs from './components/AboutUs';
import InstagramGallery from './components/InstagramGallery';
import CustomerReviews from './components/CustomerReviews';
import Footer from './components/Footer';
import { OrderFlow } from './components/OrderFlow';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { MessageCenter } from './components/MessageCenter';
import MobileBottomNav from './components/MobileBottomNav';
import MobileFAB from './components/MobileFAB';
import { requestFirebaseNotificationPermission, messaging } from './lib/firebase';
import { onMessage } from 'firebase/messaging';
import type { MenuItem, CartItem } from './data/menu';
import { apiUrl } from './lib/api';

interface User {
  email: string;
  username?: string;
  phone?: string;
  city?: string;
  isAdmin?: boolean;
  loyaltyCakes?: boolean[];
}

// Admin email list — must match server/routes/auth.cjs
const ADMIN_EMAILS = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];
const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email?.trim().toLowerCase());

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderSystemOpen, setIsOrderSystemOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' } | null>(null);

  // Helper to enrich user with computed isAdmin from email
  const enrichUser = (u: User): User => {
    if (!u) return u;
    const isAdmin = isAdminEmail(u.email);
    console.log(`Enriching user: ${u.email}, isAdmin computed: ${isAdmin}`);
    return { ...u, isAdmin };
  };

  // Check for existing token on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(apiUrl('/api/auth/me'), {
            headers: { 'x-auth-token': token }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(enrichUser(data));
            // Trigger Firebase Push Notification Permission on auto-login
            requestFirebaseNotificationPermission();
          } else {
            console.error('Failed to fetch user:', response.status);
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
    };
    fetchUser();
  }, []);

  // Listen for Firebase Push Notifications while app is in foreground
  useEffect(() => {
    if (!messaging) return;
    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground Push Notification Received:', payload);
        if (payload.notification?.body) {
          setNotification({ 
            message: payload.notification.title ? `${payload.notification.title} - ${payload.notification.body}` : payload.notification.body, 
            type: 'info' 
          });
          // Hide toast after a longer duration so they can read it
          setTimeout(() => setNotification(null), 8000);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.log('FCM onMessage listener setup failed', err);
    }
  }, []);

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart(prevCart => {
      // For customizable items, we check if the same item with SAME options exists
      const existingItem = prevCart.find(cartItem => {
        if (cartItem.id !== item.id) return false;
        
        // If it's a customizable item being added from the modal
        const itemWithOptions = item as any;
        if (itemWithOptions.selectedOptions && cartItem.selectedOptions) {
          return JSON.stringify(itemWithOptions.selectedOptions) === JSON.stringify(cartItem.selectedOptions);
        }
        
        // If it's a standard item (no options)
        return !itemWithOptions.selectedOptions && !cartItem.selectedOptions;
      });

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem === existingItem ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity } as CartItem];
    });

    // Show notification
    setNotification({ message: `${item.name} added to cart!`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotification({ message: 'Logged out successfully', type: 'info' });
    setTimeout(() => setNotification(null), 3000);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsOrderSystemOpen(true)}
        onLoginClick={() => setIsAuthOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onMessageClick={() => setIsMessageOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {notification && (
        <div className={`global-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main>
        <Hero onOrderClick={() => {
          const menuSection = document.getElementById('menu');
          menuSection?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <Trending onAddToCart={addToCart} />
        <Menu
          onAddToCart={addToCart}
        />
        <WhyChooseUs />
        <AboutUs />
        <InstagramGallery />
        <CustomerReviews isAdmin={!!user?.isAdmin} />
      </main>

      <Footer />

      <MobileBottomNav
        cartCount={cartCount}
        onCartClick={() => setIsOrderSystemOpen(true)}
        onHomeClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMenuClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
        onAdminClick={() => setIsAdminOpen(true)}
        onMessageClick={() => setIsMessageOpen(true)}
        isAdmin={!!user?.isAdmin}
        onProfileClick={() => {
          if (user) {
            setIsProfileOpen(true);
          } else {
            setIsAuthOpen(true);
          }
        }}
      />

      <MobileFAB onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} />

      {isOrderSystemOpen && (
        <OrderFlow
          cart={cart}
          onClose={() => setIsOrderSystemOpen(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
          onLoginClick={() => {
            setIsOrderSystemOpen(false);
            setIsAuthOpen(true);
          }}
          isLoggedIn={!!user}
        />
      )}

      {isAuthOpen && (
        <Auth
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(userData) => {
            setUser(enrichUser(userData));
            setNotification({ message: `Welcome back, ${userData.username || userData.email}!`, type: 'success' });
            setTimeout(() => setNotification(null), 3000);

            // Trigger Firebase Push Notification Permission on manual login
            requestFirebaseNotificationPermission();
          }}
        />
      )}

      {isProfileOpen && user && (
        <Profile
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
          onUpdate={(updatedUser) => {
            setUser(enrichUser(updatedUser));
            setNotification({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      )}

      {isAdminOpen && user?.isAdmin && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {isMessageOpen && (
        <MessageCenter onClose={() => setIsMessageOpen(false)} />
      )}
    </div>
  );
}

export default App;
