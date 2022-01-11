import {
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'


import rootReducer from './rootReducer'


const serializableMiddleware = getDefaultMiddleware({
  serializableCheck: false
})

const store = configureStore({
  reducer: rootReducer,
  middleware: serializableMiddleware,
})

export default store
