

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

        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

      
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
             
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


export function notifyServiceWorkerForSync() {
  if ('serviceWorker' in navigator && 'controller' in navigator.serviceWorker) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SYNC_QUEUE',
    });
  }
}


export function skipWaitingServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SKIP_WAITING',
    });
  }
}
