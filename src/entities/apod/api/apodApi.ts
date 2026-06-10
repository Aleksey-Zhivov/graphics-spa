import { baseApi } from '@/shared/api';

import type { ApodData } from '../model/types';

const nasaApiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

const apodApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApod: build.query<ApodData, void>({
      query: () => ({
        url: 'planetary/apod',
        params: {
          api_key: nasaApiKey,
          thumbs: true,
        },
      }),
    }),
  }),
});

export const { useGetApodQuery } = apodApi;
