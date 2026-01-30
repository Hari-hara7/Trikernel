// IndexedDB utilities for offline storage

export interface PendingMessage {
  id: string;
  conversationId: string;
  content: string;
  recipientId: string;
  timestamp: number;
  synced: boolean;
}

export interface PendingListing {
  id: string;
  cropName: string;
  quantity: number;
  price: number;
  state: string;
  quality: string;
  data: Record<string, any>;
  timestamp: number;
  synced: boolean;
}

export interface CachedData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

let dbInstance: IDBDatabase | null = null;

export async function initializeDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AgroPulseDB", 2);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Pending messages store
      if (!db.objectStoreNames.contains("pending-messages")) {
        const messageStore = db.createObjectStore("pending-messages", {
          keyPath: "id",
        });
        messageStore.createIndex("conversationId", "conversationId");
        messageStore.createIndex("timestamp", "timestamp");
        messageStore.createIndex("synced", "synced");
      }

      // Pending listings store
      if (!db.objectStoreNames.contains("pending-listings")) {
        const listingStore = db.createObjectStore("pending-listings", {
          keyPath: "id",
        });
        listingStore.createIndex("timestamp", "timestamp");
        listingStore.createIndex("synced", "synced");
      }

      // Cached data store
      if (!db.objectStoreNames.contains("cached-data")) {
        const cacheStore = db.createObjectStore("cached-data", {
          keyPath: "id",
        });
        cacheStore.createIndex("type", "type");
        cacheStore.createIndex("expiresAt", "expiresAt");
      }

      // Generic pending queue
      if (!db.objectStoreNames.contains("pending-queue")) {
        db.createObjectStore("pending-queue", { keyPath: "id" });
      }
    };
  });
}

// Message operations
export async function savePendingMessage(
  message: PendingMessage
): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readwrite");
    const store = transaction.objectStore("pending-messages");
    const request = store.add(message);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPendingMessages(): Promise<PendingMessage[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readonly");
    const store = transaction.objectStore("pending-messages");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result as PendingMessage[];
      const unsynced = results.filter((m) => !m.synced);
      resolve(unsynced);
    };
  });
}

export async function markMessageAsSynced(messageId: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readwrite");
    const store = transaction.objectStore("pending-messages");
    const request = store.get(messageId);

    request.onsuccess = () => {
      const message = request.result;
      if (message) {
        message.synced = true;
        const updateRequest = store.put(message);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function deletePendingMessage(messageId: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readwrite");
    const store = transaction.objectStore("pending-messages");
    const request = store.delete(messageId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Listing operations
export async function savePendingListing(listing: PendingListing): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-listings"], "readwrite");
    const store = transaction.objectStore("pending-listings");
    const request = store.add(listing);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPendingListings(): Promise<PendingListing[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-listings"], "readonly");
    const store = transaction.objectStore("pending-listings");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result as PendingListing[];
      const unsynced = results.filter((l) => !l.synced);
      resolve(unsynced);
    };
  });
}

export async function markListingAsSynced(listingId: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-listings"], "readwrite");
    const store = transaction.objectStore("pending-listings");
    const request = store.get(listingId);

    request.onsuccess = () => {
      const listing = request.result;
      if (listing) {
        listing.synced = true;
        const updateRequest = store.put(listing);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function deletePendingListing(listingId: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-listings"], "readwrite");
    const store = transaction.objectStore("pending-listings");
    const request = store.delete(listingId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Cache operations
export async function cacheData(
  id: string,
  type: string,
  data: any,
  ttlMinutes: number = 60
): Promise<void> {
  const db = await initializeDB();
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached-data"], "readwrite");
    const store = transaction.objectStore("cached-data");
    const request = store.put({
      id,
      type,
      data,
      timestamp: now,
      expiresAt,
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getCachedData(id: string): Promise<any | null> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached-data"], "readonly");
    const store = transaction.objectStore("cached-data");
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result && result.expiresAt > Date.now()) {
        resolve(result.data);
      } else {
        resolve(null);
      }
    };
  });
}

export async function getCachedDataByType(type: string): Promise<any[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached-data"], "readonly");
    const store = transaction.objectStore("cached-data");
    const index = store.index("type");
    const request = index.getAll(type);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const now = Date.now();
      const results = request.result as CachedData[];
      const valid = results.filter((item) => item.expiresAt > now);
      resolve(valid.map((item) => item.data));
    };
  });
}

export async function clearExpiredCache(): Promise<void> {
  const db = await initializeDB();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached-data"], "readwrite");
    const store = transaction.objectStore("cached-data");
    const index = store.index("expiresAt");
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
}

// Pending queue (generic)
export async function addToPendingQueue(item: any): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-queue"], "readwrite");
    const store = transaction.objectStore("pending-queue");
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPendingQueue(): Promise<any[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-queue"], "readonly");
    const store = transaction.objectStore("pending-queue");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function removeFromPendingQueue(id: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-queue"], "readwrite");
    const store = transaction.objectStore("pending-queue");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearAllData(): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["pending-messages", "pending-listings", "cached-data", "pending-queue"],
      "readwrite"
    );

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();

    ["pending-messages", "pending-listings", "cached-data", "pending-queue"].forEach(
      (store) => {
        transaction.objectStore(store).clear();
      }
    );
  });
}
