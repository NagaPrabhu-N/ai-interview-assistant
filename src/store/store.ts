import { configureStore, combineReducers } from '@reduxjs/toolkit';
import interviewReducer from './interviewSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Configuration object for Redux Persist
const persistConfig = {
  key: 'root', // The key for the root of the storage
  storage, // The storage engine to use
  whitelist: ['interview'], // Only the 'interview' slice will be persisted
};

// Combine reducers (even if there's only one, this is good practice)
const rootReducer = combineReducers({
  interview: interviewReducer,
});

// Create a new reducer that is enhanced with persistence capabilities
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types, which are dispatched by redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create a persistor object
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
