
'use client';

import { useOfflineSupport } from '~/hooks/use-offline';
import { WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '~/lib/utils';

export function OfflineIndicator() {
  const { isOnline, pendingMessages, pendingListings, isSyncing } = useOfflineSupport();

  if (isOnline && !isSyncing && pendingMessages === 0 && pendingListings === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg p-4 flex items-start gap-3',
        !isOnline
          ? 'bg-orange-50 border border-orange-200'
          : 'bg-blue-50 border border-blue-200'
      )}
    >
      <div className="flex-shrink-0">
        {!isOnline ? (
          <WifiOff className="h-5 w-5 text-orange-500" />
        ) : isSyncing ? (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        ) : (
          <AlertCircle className="h-5 w-5 text-blue-500" />
        )}
      </div>

      <div className="flex-1">
        {!isOnline ? (
          <>
            <p className="font-semibold text-orange-900">You're Offline</p>
            <p className="text-sm text-orange-700 mt-1">
              {pendingMessages > 0 || pendingListings > 0
                ? `${pendingMessages} message${pendingMessages !== 1 ? 's' : ''} and ${pendingListings} listing${pendingListings !== 1 ? 's' : ''} will sync when online`
                : 'Your drafts will sync when you reconnect'}
            </p>
          </>
        ) : isSyncing ? (
          <>
            <p className="font-semibold text-blue-900">Syncing...</p>
            <p className="text-sm text-blue-700 mt-1">Uploading your offline changes</p>
          </>
        ) : pendingMessages > 0 || pendingListings > 0 ? (
          <>
            <p className="font-semibold text-blue-900">Ready to Sync</p>
            <p className="text-sm text-blue-700 mt-1">
              {pendingMessages > 0 || pendingListings > 0
                ? `${pendingMessages} message${pendingMessages !== 1 ? 's' : ''} and ${pendingListings} listing${pendingListings !== 1 ? 's' : ''} pending`
                : 'All changes synced'}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
