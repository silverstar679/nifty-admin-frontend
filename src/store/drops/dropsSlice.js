import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'loading',
  drops: [],
}

export const dropsSlice = createSlice({
  name: 'drops',
  initialState,
  reducers: {
    storeDrops: (state, action) => {
      state.status = 'idle'
      state.drops = action.payload
    },
  },
})

export const selectDrops = (state) => state.drops

export const { storeDrops } = dropsSlice.actions
export default dropsSlice.reducer
