// src/db.ts
import { init, id } from '@instantdb/react';

// Get app ID from environment
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

// Initialize InstantDB only if an app id is provided
export const db = APP_ID
  ? init({ appId: APP_ID })
  : new Proxy({} as any, {
      get(_target, prop) {
        const hint =
          'InstantDB is not configured. Set NEXT_PUBLIC_INSTANT_APP_ID in .env.local to use `db.' +
          String(prop) +
          '`.';
        throw new Error(hint);
      },
    });

// Export id generator for convenience
export { id };

// Type exports for convenience
export type { AppSchema } from '../instant.schema';

export type Video = {
  id: string;
  title: string;
  brandName: string;
  productName: string;
  template: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string | number;
};
