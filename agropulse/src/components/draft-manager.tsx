// Draft manager component for viewing and managing pending actions

'use client';

import { useState, useEffect } from 'react';
import { Trash2, Send, AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { useDraftMessages } from '~/hooks/use-draft-messages';
import { useDraftListings } from '~/hooks/use-draft-listings';
import { useOfflineSupport } from '~/hooks/use-offline';
import { formatRelativeTime } from '~/lib/utils';

export function DraftManager() {
  const [isOpen, setIsOpen] = useState(false);
  const { drafts: messageDrafts, loadDrafts: loadMessageDrafts, deleteDraft: deleteMessageDraft } = useDraftMessages();
  const { drafts: listingDrafts, loadDrafts: loadListingDrafts, deleteDraft: deleteListingDraft } = useDraftListings();
  const { isOnline } = useOfflineSupport();

  useEffect(() => {
    if (isOpen) {
      loadMessageDrafts();
      loadListingDrafts();
    }
  }, [isOpen, loadMessageDrafts, loadListingDrafts]);

  const totalDrafts = messageDrafts.length + listingDrafts.length;

  if (totalDrafts === 0 || isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 max-w-sm">
      {isOpen && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Drafts</span>
              <Badge variant="outline">{totalDrafts}</Badge>
            </CardTitle>
            <CardDescription>
              These will be sent when you're back online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messageDrafts.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-sm text-gray-700">
                  Message Drafts ({messageDrafts.length})
                </p>
                {messageDrafts.map((draft) => (
                  <div key={draft.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 line-clamp-2">{draft.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(new Date(draft.timestamp))}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMessageDraft(draft.id)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {listingDrafts.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-sm text-gray-700">
                  Listing Drafts ({listingDrafts.length})
                </p>
                {listingDrafts.map((draft) => (
                  <div key={draft.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{draft.cropName}</p>
                        <p className="text-xs text-gray-600">
                          {draft.quantity} units @ ₹{draft.price} • {draft.state}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(new Date(draft.timestamp))}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteListingDraft(draft.id)}
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                All drafts will automatically sync when you regain internet connection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 w-full"
        variant={isOpen ? 'outline' : 'default'}
      >
        {isOpen ? 'Hide' : `View Drafts (${totalDrafts})`}
      </Button>
    </div>
  );
}
