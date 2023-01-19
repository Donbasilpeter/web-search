import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/search/',
    prepareHeaders: (headers) => {
      // Django requires this for security (cross-site forgery protection) once logged in
      headers.set('X-Csrftoken', window.CSRF_TOKEN);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getSearch: builder.mutation({
      query: (credentials) => ({
        url: 'search',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    getTotalCount: builder.mutation({
      query: (queryObject) => ({
        url: 'total-count',
        method: 'POST',
        body: { queryObject },
      }),
    }),
    getCountOverTime: builder.mutation({
      query: (queryObject) => ({
        url: 'count-over-time',
        method: 'POST',
        body: { queryObject },
      }),
    }),
    getSampleStories: builder.mutation({
      query: (queryObject) => ({
        url: 'sample',
        method: 'POST',
        body: { queryObject },
      }),
    }),
    getStoryDetails: builder.query({
      query: (storyId) => ({
        url: `story?storyId=${storyId}`,
        method: 'GET',
      }),
    }),
  }),
});

// search/attentionOverTime
// search
// action: get back Json. Save it to searchResults
export const {
  useGetSearchMutation,
  useGetTotalCountMutation,
  useGetCountOverTimeMutation,
  useGetSampleStoriesMutation,
  useGetStoryDetailsQuery,
} = searchApi;
