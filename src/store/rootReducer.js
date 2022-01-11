import { combineReducers } from '@reduxjs/toolkit'
import dropsReducer from './drops/dropsSlice'

const rootReducer = combineReducers({
  drops: dropsReducer,
})

export default rootReducer
