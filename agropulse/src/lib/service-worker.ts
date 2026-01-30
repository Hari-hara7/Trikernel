// Service Worker registration and management

'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // Handle update found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // New service worker activated
              // You can notify the user about available updates
              console.log('New service worker available');
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);
}

// Function to notify service worker about online status and trigger sync
export function notifyServiceWorkerForSync() {
  if ('serviceWorker' in navigator && 'controller' in navigator.serviceWorker) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SYNC_QUEUE',
    });
  }
}

// Function to skip waiting and activate new service worker
export function skipWaitingServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SKIP_WAITING',
    });
  }
}
