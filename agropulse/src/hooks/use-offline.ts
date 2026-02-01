

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getPendingMessages,
  getPendingListings,
  markMessageAsSynced,
  markListingAsSynced,
} from '~/lib/db.offline';

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [pendingListings, setPendingListings] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

 
  const loadPendingCounts = useCallback(async () => {
    try {
      const messages = await getPendingMessages();
      const listings = await getPendingListings();
      setPendingMessages(messages.length);
      setPendingListings(listings.length);
    } catch (error) {
      console.error('Failed to load pending counts:', error);
    }
  }, []);

  
  const syncPendingData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const messages = await getPendingMessages();
      const listings = await getPendingListings();

      // In a real app, these would be API calls
      // For now, we'll just mark them as synced after a delay
      for (const message of messages) {
        if (!message.synced) {
          await markMessageAsSynced(message.id);
        }
      }

      for (const listing of listings) {
        if (!listing.synced) {
          await markListingAsSynced(listing.id);
        }
      }

      await loadPendingCounts();
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadPendingCounts]);

  // Load pending counts on mount
  useEffect(() => {
    loadPendingCounts();
  }, [loadPendingCounts]);

  return {
    isOnline,
    pendingMessages,
    pendingListings,
    isSyncing,
    syncPendingData,
    loadPendingCounts,
  };
}
