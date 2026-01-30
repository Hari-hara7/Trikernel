# AgroPulse Offline & PWA Features

## Overview

AgroPulse is now a fully offline-capable Progressive Web App (PWA) with advanced offline support. Users can install the app on their devices and use most features even without an internet connection.

## Features

### 1. **Progressive Web App (PWA)**

#### Installation
- **Desktop**: Click the "Install" button in the address bar
- **Mobile**: Use "Add to Home Screen" from the browser menu
- **Features**: Standalone app experience without opening a browser

#### What You Get
- App icon on home screen / desktop
- App name "AgroPulse" in the app switcher
- Custom splash screen on startup
- Status bar theming (green for theme color)
- App shortcuts for quick access

### 2. **Offline Message Drafting**

Users can draft messages while offline and they'll be sent automatically when online.

**How it works:**
1. Write a message in the chat interface
2. If offline, the message is saved locally to IndexedDB
3. When connection is restored, messages sync automatically
4. Draft manager shows all pending messages

**Features:**
- Unlimited draft messages
- Local storage in IndexedDB
- Automatic sync on reconnection
- Manual delete of drafts if needed
- Timestamp tracking for each draft

### 3. **Offline Listing Creation**

Farmers can create crop listings offline and submit them when online.

**How it works:**
1. Fill out the new listing form
2. Click save draft (or it saves automatically)
3. Draft is stored locally in IndexedDB
4. When online, click "Submit All Drafts" to upload
5. Server processes listings and returns confirmation

**Features:**
- Full form persistence
- Upload all drafts at once
- Individual draft deletion
- Automatic sync notification
- Progress tracking for submissions

### 4. **Service Worker Caching**

#### Caching Strategy

**Network-First (API calls):**
```
1. Try network request
2. If successful, cache response
3. If fails, use cached response
4. If no cache, return offline error
```

**Cache-First (Static assets):**
```
1. Check cache first
2. If found and valid, return cached
3. If not found, fetch from network
4. If network fails, use cached or offline page
```

#### What Gets Cached
- HTML pages and layouts
- CSS and JavaScript files
- Images and fonts
- Previous API responses
- Market price data
- Chat messages
- Crop listings

#### Cache Duration
- Static assets: Cached for entire session
- API responses: 60 minutes default (configurable per data type)
- Expired cache automatically cleared
- Cache size: Typically 5-10 MB

### 5. **Offline Data Access**

#### What You Can View Offline
- ✅ Previously loaded crop listings
- ✅ Cached market prices and trends
- ✅ Historical chat conversations
- ✅ Your profile information
- ✅ Saved drafts and pending actions
- ✅ Rating and review history

#### What Requires Internet
- ❌ Live bidding (requires server)
- ❌ Real-time notifications
- ❌ New user searches
- ❌ Live market price updates
- ❌ AI predictions (on-demand)

### 6. **Draft Manager**

A dedicated interface for managing offline drafts.

**Features:**
- View all pending messages and listings
- Delete unwanted drafts
- Sync status indicator
- Auto-sync when online
- Organized by type (messages vs listings)

**Location:** Bottom-right corner when offline, hidden when online

### 7. **Offline Indicator**

Real-time indicator showing connectivity status.

**Shows:**
- 🔴 **Offline**: Current connection status
- 🟡 **Syncing**: Active background sync
- 🟢 **Online**: Ready to sync
- Pending action counts

**Location:** Bottom-right corner of dashboard

## Technical Implementation

### Service Worker (`public/service-worker.js`)

Handles:
- Request interception
- Cache management
- Offline responses
- Background sync
- IndexedDB communication

### IndexedDB (`src/lib/db.offline.ts`)

Stores:
- Pending messages
- Pending listings
- Cached API responses
- Generic pending queue

**Stores:**
```
- pending-messages (indexed by: conversationId, timestamp, synced)
- pending-listings (indexed by: timestamp, synced)
- cached-data (indexed by: type, expiresAt)
- pending-queue (generic queue)
```

### React Hooks

#### `useOfflineSupport()`
```typescript
const {
  isOnline,           // boolean
  pendingMessages,    // number
  pendingListings,    // number
  isSyncing,          // boolean
  syncPendingData,    // () => Promise<void>
  loadPendingCounts,  // () => Promise<void>
} = useOfflineSupport();
```

#### `useDraftMessages()`
```typescript
const {
  drafts,                      // PendingMessage[]
  isLoading,                   // boolean
  loadDrafts,                  // () => Promise<void>
  saveDraft,                   // (conversationId, content, recipientId) => Promise<PendingMessage>
  deleteDraft,                 // (draftId) => Promise<void>
  getDraftForConversation,     // (conversationId) => PendingMessage | undefined
} = useDraftMessages();
```

#### `useDraftListings()`
```typescript
const {
  drafts,                      // PendingListing[]
  isLoading,                   // boolean
  loadDrafts,                  // () => Promise<void>
  saveDraft,                   // (cropName, quantity, price, state, quality, data) => Promise<PendingListing>
  deleteDraft,                 // (draftId) => Promise<void>
  getAllDrafts,                // () => PendingListing[]
} = useDraftListings();
```

#### `useServiceWorker()`
- Registers service worker on component mount
- Handles service worker updates
- Manages controller changes
- Periodic update checks

### Components

#### `<OfflineIndicator />`
- Shows connection status
- Displays pending action counts
- Shows sync progress
- Appears when offline or syncing

#### `<DraftManager />`
- Lists all pending messages and listings
- Allows draft deletion
- Shows sync information
- Expandable/collapsible interface

#### `<ServiceWorkerRegistration />`
- Registers service worker
- Handles updates
- Manages app lifecycle

### Manifest (`public/manifest.json`)

Defines PWA capabilities:
- App name and description
- Display mode (standalone)
- Theme colors
- App icons
- Shortcuts
- Screen captures

## Usage Guide

### For Users

#### Installing as App
1. **Desktop (Chrome/Edge):**
   - Visit agropulse.app
   - Click "Install" in address bar
   - Launch from desktop/start menu

2. **Mobile (Chrome/Safari):**
   - Visit agropulse.app
   - Menu → "Add to Home Screen"
   - App appears on home screen
   - Open like any installed app

#### Using Offline Features
1. **Draft a Message:**
   - Open chat
   - Type message
   - Send while offline (auto-saved)
   - View in draft manager
   - Auto-sends when online

2. **Create Listing:**
   - Click "New Listing"
   - Fill form while offline
   - Save draft (auto-saves)
   - Submit all when online

3. **View Cached Data:**
   - Offline = view previously loaded content
   - Market prices refresh on sync
   - Conversations load from cache

#### Managing Drafts
- Click "View Drafts (X)" in bottom-right
- See all pending messages and listings
- Delete unwanted drafts
- Monitor sync status

### For Developers

#### Adding Offline Support to New Pages

1. **Import the hooks:**
```typescript
import { useOfflineSupport } from '~/hooks/use-offline';
import { useDraftMessages } from '~/hooks/use-draft-messages';
```

2. **Check connection:**
```typescript
const { isOnline, syncPendingData } = useOfflineSupport();

if (!isOnline) {
  // Show offline UI or cached data
}
```

3. **Draft a message:**
```typescript
const { saveDraft, drafts } = useDraftMessages();

const handleSendMessage = async (content: string) => {
  if (!isOnline) {
    await saveDraft(conversationId, content, recipientId);
  } else {
    // Send to server
  }
};
```

#### Caching API Responses

```typescript
import { cacheData, getCachedData } from '~/lib/db.offline';

// Cache data
await cacheData('prices-2026-01', 'mandi-prices', priceData, 120); // 120 minute TTL

// Retrieve cached data
const cached = await getCachedData('prices-2026-01');
if (cached) {
  // Use cached data
}
```

#### Testing Offline Mode

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Offline" dropdown
4. Select "Offline"
5. App should work with cached data

**Alternative:**
1. Disable WiFi and mobile data
2. Test app functionality
3. Check draft manager
4. Restore internet and verify sync

## Performance

### Bundle Size Impact
- Service Worker: ~8 KB
- Offline utilities: ~15 KB
- React hooks: ~5 KB
- Total: ~30 KB (gzipped)

### Storage Usage
- IndexedDB: 5-10 MB typical
- Cache Storage: 10-20 MB
- Total: ~30 MB (configurable)

### Sync Speed
- Messages: < 1 second per message
- Listings: 2-5 seconds per listing
- Parallel syncing supported

## Best Practices

### Do's ✅
- ✅ Test offline mode regularly
- ✅ Clear cache when needed
- ✅ Monitor storage usage
- ✅ Provide visual offline feedback
- ✅ Batch sync operations
- ✅ Set appropriate cache TTLs

### Don'ts ❌
- ❌ Don't cache sensitive data
- ❌ Don't sync large files offline
- ❌ Don't ignore sync failures
- ❌ Don't cache forever (set TTL)
- ❌ Don't block UI during sync
- ❌ Don't store passwords offline

## Troubleshooting

### Service Worker Not Installing
**Problem:** Service worker won't register
**Solution:**
1. Check HTTPS is enabled (required for PWA)
2. Verify service-worker.js exists
3. Clear browser cache
4. Check browser console for errors
5. Try in incognito mode

### Drafts Not Syncing
**Problem:** Offline drafts not syncing when online
**Solution:**
1. Check internet connection
2. Verify service worker is active (DevTools → Application → Service Workers)
3. Check IndexedDB in DevTools (Storage → IndexedDB)
4. Manually trigger sync via UI
5. Check server logs for errors

### App Won't Install
**Problem:** Install button not appearing
**Solution:**
1. Must use HTTPS
2. Must have valid manifest.json
3. Must have service worker
4. Clear browser cache
5. Try different browser (Chrome, Edge, Safari)

### Cache Too Large
**Problem:** Storage usage is high
**Solution:**
1. Clear expired cache (automatic, but can force)
2. Reduce cache TTL for data types
3. Remove old cached responses
4. Limit number of cached items

## Future Enhancements

- [ ] Sync conflict resolution
- [ ] Selective sync (choose what to cache)
- [ ] Periodic background sync
- [ ] Voice message drafting
- [ ] Image upload queue
- [ ] Batch operations UI
- [ ] Cache statistics dashboard
- [ ] Manual cache management UI

## Support

For offline feature issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Check IndexedDB in DevTools
4. Verify service worker status
5. Test in incognito/private mode
6. Contact support team with details
