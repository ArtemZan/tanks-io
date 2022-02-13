import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PlayerState = {
    id: string | null
}

export default createSlice({
    initialState: {id: null} as PlayerState,
    name: "player",
    reducers: {
        setId: (state, action: PayloadAction<string | null>) => { state.id = action.payload }
    }
})