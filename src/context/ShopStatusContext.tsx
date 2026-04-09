import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../lib/api';

interface ShopStatus {
  isOpen: boolean;
  calculatedStatus: 'OPEN' | 'CLOSED' | null;
  reason?: string;
}

interface ShopStatusContextType {
  status: ShopStatus;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

const ShopStatusContext = createContext<ShopStatusContextType | undefined>(undefined);

export const ShopStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ShopStatus>({ isOpen: true, calculatedStatus: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/settings/status'), {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus({
          isOpen: data.isOpen,
          calculatedStatus: data.calculatedStatus,
          reason: data.reason
        });
        setError(null);
      } else {
        // If we get an error or HTML, handle it
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.error('Expected JSON but got HTML. Server routing issue?');
          setError('Server configuration error');
        } else {
          setError('Failed to fetch shop status');
        }
      }
    } catch (err) {
      console.error('Error fetching shop status:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    // Poll every 60 seconds
    const interval = setInterval(refreshStatus, 60000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <ShopStatusContext.Provider value={{ status, isLoading, error, refreshStatus }}>
      {children}
    </ShopStatusContext.Provider>
  );
};

export const useShopStatus = () => {
  const context = useContext(ShopStatusContext);
  if (context === undefined) {
    throw new Error('useShopStatus must be used within a ShopStatusProvider');
  }
  return context;
};
