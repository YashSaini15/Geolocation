import { combineReducers, configureStore } from "@reduxjs/toolkit";
import SavedLocationsSlice from "./locations-slice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const rootReducer = combineReducers({
  location: SavedLocationsSlice.reducer,
})

const persistConfig = {
  key:'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store)
