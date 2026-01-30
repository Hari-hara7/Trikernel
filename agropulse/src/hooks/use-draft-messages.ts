// Draft message management

'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { savePendingMessage, getPendingMessages, deletePendingMessage } from '~/lib/db.offline';
import type { PendingMessage } from '~/lib/db.offline';

export function useDraftMessages() {
  const [drafts, setDrafts] = useState<PendingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load drafts from IndexedDB
  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const messages = await getPendingMessages();
      setDrafts(messages.filter((m) => !m.synced));
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a draft message
  const saveDraft = useCallback(
    async (
      conversationId: string,
      content: string,
      recipientId: string
    ) => {
      const draft: PendingMessage = {
        id: uuidv4(),
        conversationId,
        content,
        recipientId,
        timestamp: Date.now(),
        synced: false,
      };

      try {
        await savePendingMessage(draft);
        setDrafts((prev) => [...prev, draft]);
        return draft;
      } catch (error) {
        console.error('Failed to save draft:', error);
        throw error;
      }
    },
    []
  );

  // Delete a draft
  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      await deletePendingMessage(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw error;
    }
  }, []);

  // Get draft for a conversation
  const getDraftForConversation = useCallback(
    (conversationId: string) => {
      return drafts.find((d) => d.conversationId === conversationId);
    },
    [drafts]
  );

  return {
    drafts,
    isLoading,
    loadDrafts,
    saveDraft,
    deleteDraft,
    getDraftForConversation,
  };
}
