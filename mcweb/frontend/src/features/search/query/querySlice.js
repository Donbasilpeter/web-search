import { createSlice, current } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { PROVIDER_NEWS_WAYBACK_MACHINE, latestAllowedEndDate } from '../util/platforms';

const DEFAULT_PROVIDER = PROVIDER_NEWS_WAYBACK_MACHINE;
export const DEFAULT_ONLINE_NEWS_COLLECTIONS = [{
  type: 'collection',
  id: 34412234,
  name: 'United States - National',
  platform: 'online_news',
  public: true,
}];

const startDate = dayjs().subtract(34, 'day').format('MM/DD/YYYY');

const querySlice = createSlice({
  name: 'query',
  initialState:
  [
    {
      queryString: '',
      queryList: [[], [], []],
      negatedQueryList: [[], [], []],
      platform: DEFAULT_PROVIDER,
      startDate,
      endDate: dayjs(latestAllowedEndDate(DEFAULT_PROVIDER)).format('MM/DD/YYYY'),
      collections: DEFAULT_ONLINE_NEWS_COLLECTIONS,
      previewCollections: DEFAULT_ONLINE_NEWS_COLLECTIONS,
      sources: [],
      previewSources: [],
      lastSearchTime: dayjs().unix(),
      anyAll: 'any',
      advanced: false,
    },
  ],

  reducers: {
    addSelectedMedia: (state, { payload }) => {
      const { queryIndex, sourceOrCollection } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.collections = sourceOrCollection.filter((c) => c.type === 'collection');
      currentSlice.sources = sourceOrCollection.filter((c) => c.type === 'source');
    },
    addPreviewSelectedMedia: (state, { payload }) => {
      const { queryIndex, sourceOrCollection } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.previewCollections = [
        ...currentSlice.previewCollections,
        ...sourceOrCollection.filter((c) => c.type === 'collection'),
      ];
      currentSlice.previewSources = [...currentSlice.previewSources, ...sourceOrCollection.filter((c) => c.type === 'source')];
    },
    resetSelectedAndPreviewMedia: (state, { payload }) => {
      const { queryIndex } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.collections = [];
      currentSlice.sources = [];
    },
    removeSelectedMedia: (state, { payload }) => {
      const { queryIndex, sourceOrCollection } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.collections = sourceOrCollection.type === 'collection'
        ? currentSlice.collections.filter((c) => c.id !== sourceOrCollection.id) : currentSlice.collections;
      currentSlice.previewCollections = sourceOrCollection.type === 'collection'
        ? currentSlice.previewCollections.filter((c) => c.id !== sourceOrCollection.id) : currentSlice.collections;
      currentSlice.sources = sourceOrCollection.type === 'source'
        ? currentSlice.sources.filter((s) => s.id !== sourceOrCollection.id) : currentSlice.sources;
      currentSlice.previewSources = sourceOrCollection.type === 'source'
        ? currentSlice.previewSources.filter((s) => s.id !== sourceOrCollection.id) : currentSlice.sources;
    },
    setPreviewSelectedMedia: (state, { payload }) => {
      const { queryIndex, sourceOrCollection } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.previewCollections = sourceOrCollection.filter((c) => c.type === 'collection');
      currentSlice.previewSources = sourceOrCollection.filter((c) => c.type === 'source');
    },
    removePreviewSelectedMedia: (state, { payload }) => {
      const { queryIndex, sourceOrCollection } = payload;
      const currentSlice = state[queryIndex];
      currentSlice.previewCollections = currentSlice.previewCollections.filter((c) => c.id !== sourceOrCollection.id);
      currentSlice.previewSources = currentSlice.previewSources.filter((s) => s.id !== sourceOrCollection.id);
    },
    setQueryProperty: (state, { payload }) => {
      const queryProperty = payload.property;
      const currentQuerySlice = state[payload.queryIndex];
      currentQuerySlice[queryProperty] = payload[queryProperty];
    },
    addQuery: (state, { payload }) => {
      const freezeState = state;
      freezeState.push(
        {
          queryString: '',
          queryList: [[], [], []],
          negatedQueryList: [[], [], []],
          platform: payload,
          startDate,
          endDate: dayjs(latestAllowedEndDate(DEFAULT_PROVIDER)).format('MM/DD/YYYY'),
          collections: [],
          previewCollections: [],
          sources: [],
          previewSources: [],
          lastSearchTime: dayjs().unix(),
          anyAll: 'any',
          advanced: false,
        },
      );
    },
    setPlatform: (state, { payload }) => {
      const newState = [
        {
          queryString: '',
          queryList: [[], [], []],
          negatedQueryList: [[], [], []],
          platform: `${payload}`,
          startDate,
          endDate: dayjs(latestAllowedEndDate(DEFAULT_PROVIDER)).format('MM/DD/YYYY'),
          collections: [],
          previewCollections: [],
          sources: [],
          previewSources: [],
          lastSearchTime: dayjs().unix(),
          anyAll: 'any',
          advanced: false,
        },
      ];
      return newState;
    },
    setLastSearchTime: (state, { payload }) => {
      const freezeState = state;

      freezeState.forEach((qS) => {
        qS.lastSearchTime = payload;
      });
    },
  },
});

export const {
  addSelectedMedia,
  removeSelectedMedia,
  setQueryProperty,
  addPreviewSelectedMedia,
  removePreviewSelectedMedia,
  setPreviewSelectedMedia,
  resetSelectedAndPreviewMedia,
  addQuery,
  setPlatform,
  setLastSearchTime,
} = querySlice.actions;

export default querySlice.reducer;
