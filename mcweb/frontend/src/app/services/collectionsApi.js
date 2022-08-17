import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const collectionsApi = createApi({
  reducerPath: 'collectionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/sources/collections/',
    prepareHeaders: (headers, { getState }) => {
      // Django requires this for security (cross-site forgery protection) once logged in
      headers.set('X-Csrftoken', window.CSRF_TOKEN);
      return headers;
    },
  }),

  endpoints: (builder) => ({
    
  
    getCollection: builder.query({
      query: (id) => ({
        url: `${id}/`,
        method: 'GET'
      }),
    }),
    postCollection: builder.mutation({
      query: (collection) => ({
        method: 'POST',
        body: { ...collection }
      })
    }),
    updateCollection: builder.mutation({
      query: (collectionID) => ({
        url: '/${collectionID}',
        method: 'PATCH',
        body: { ...collectionID }
      })
    }),
    deleteCollection: builder.mutation({
      query: (collectionID) => ({
        url: '/${collectionID}/',
        method: 'DELETE',
        body: { collectionID }
      }),
    }),
  })
})

export const {
  useGetCollectionQuery,
  usePostCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation
} = collectionsApi