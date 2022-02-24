import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ConnectionState = {
    id: string | null
}

export default createSlice({
    initialState: {id: null} as ConnectionState,
    name: "connection",
    reducers: {
        setId: (state, action: PayloadAction<string | null>) => { state.id = action.payload }
    }
})