import { baseApi } from '@/shared/api';

import type { ApodData } from '../model/types';

const nasaApiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const APOD_CACHE_KEY = 'solar-atlas-apod';
const APOD_CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;
const APOD_FRESH_CACHE_LIFETIME = 12 * 60 * 60 * 1000;

type CachedApod = {
  cachedAt: number;
  data: ApodData;
};

function readCachedApod(maxAge = APOD_CACHE_LIFETIME): ApodData | null {
  try {
    const cached = JSON.parse(localStorage.getItem(APOD_CACHE_KEY) || 'null') as CachedApod | null;

    if (!cached || Date.now() - cached.cachedAt > maxAge || !cached.data?.url) {
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

function cacheApod(data: ApodData) {
  try {
    localStorage.setItem(
      APOD_CACHE_KEY,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      } satisfies CachedApod),
    );
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

const apodApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApod: build.query<ApodData, void>({
      queryFn: async (_argument, _api, _extraOptions, baseQuery) => {
        const freshCachedData = readCachedApod(APOD_FRESH_CACHE_LIFETIME);

        if (freshCachedData) {
          return { data: freshCachedData };
        }

        const result = await baseQuery({
          url: 'planetary/apod',
          params: {
            api_key: nasaApiKey,
            thumbs: true,
          },
        });

        if (result.data) {
          const data = result.data as ApodData;
          cacheApod(data);

          return { data };
        }

        const cachedData = readCachedApod();

        if (cachedData) {
          return { data: cachedData };
        }

        if (result.error) {
          return { error: result.error };
        }

        return {
          error: {
            status: 'CUSTOM_ERROR',
            error: 'NASA APOD returned an empty response',
          },
        };
      },
    }),
  }),
});

export const { useGetApodQuery } = apodApi;
export const usePrefetchApod = () => apodApi.usePrefetch('getApod');
