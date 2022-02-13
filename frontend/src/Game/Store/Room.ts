import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RoomState = {
    id: string | null
}

export default createSlice({
    initialState: {id: null} as RoomState,
    name: "room",
    reducers: {
        setId: (state, action: PayloadAction<string | null>) => {state.id = action.payload}
    }
})
