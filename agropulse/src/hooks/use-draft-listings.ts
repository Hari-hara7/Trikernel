

'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { savePendingListing, getPendingListings, deletePendingListing } from '~/lib/db.offline';
import type { PendingListing } from '~/lib/db.offline';

export function useDraftListings() {
  const [drafts, setDrafts] = useState<PendingListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  
  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const listings = await getPendingListings();
      setDrafts(listings.filter((l) => !l.synced));
    } catch (error) {
      console.error('Failed to load listing drafts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

 
  const saveDraft = useCallback(
    async (
      cropName: string,
      quantity: number,
      price: number,
      state: string,
      quality: string,
      data: Record<string, any>
    ) => {
      const draft: PendingListing = {
        id: uuidv4(),
        cropName,
        quantity,
        price,
        state,
        quality,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      try {
        await savePendingListing(draft);
        setDrafts((prev) => [...prev, draft]);
        return draft;
      } catch (error) {
        console.error('Failed to save listing draft:', error);
        throw error;
      }
    },
    []
  );

  
  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      await deletePendingListing(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch (error) {
      console.error('Failed to delete listing draft:', error);
      throw error;
    }
  }, []);

  
  const getAllDrafts = useCallback(() => {
    return drafts;
  }, [drafts]);

  return {
    drafts,
    isLoading,
    loadDrafts,
    saveDraft,
    deleteDraft,
    getAllDrafts,
  };
}
