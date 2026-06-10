import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const nasaBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: 'https://api.nasa.gov/',
    timeout: 8000,
  }),
  {
    maxRetries: 3,
  },
);

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: nasaBaseQuery,
  endpoints: () => ({}),
});
