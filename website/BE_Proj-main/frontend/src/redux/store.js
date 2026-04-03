import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import workSlice from "./workSlice";
import applicationSlice from "./applicationSlice";
import reviewSlice from "./reviewSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  migrate: (state) =>
    Promise.resolve(
      state
        ? {
            ...state,
            work: {
              ...state.work,
              browseFilters: state.work?.browseFilters ?? {
                city: '',
                skill: '',
                availability: '',
              },
            },
          }
        : state,
    ),
}

const rootReducer = combineReducers({
    auth : authSlice,
    work : workSlice,
    application : applicationSlice,
    review : reviewSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

});

export default store;