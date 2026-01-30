'use client';

import { useServiceWorker } from '~/lib/service-worker';

export function ServiceWorkerRegistration() {
  useServiceWorker();
  return null;
}
