import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import authReducer from './slice';
import filterReducer from './FilterSlice'
import notificationsReducer from './notificationsSlice'
import { PERSIST } from "redux-persist/es/constants";

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth' , 'notification']
}

const rootReducer = combineReducers({
    auth: authReducer,
    filter : filterReducer,
    notifications : notificationsReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [PERSIST],
            },
        }),
});

const persistor = persistStore(store)
export { store, persistor }
