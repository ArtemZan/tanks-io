import { createSlice } from "@reduxjs/toolkit";

export type GameState = {
    hasStarted: boolean
}

export default createSlice({
    initialState: {} as GameState,
    name: "game",
    reducers: {
        start: state => { state.hasStarted = true; },
        end: state => { state.hasStarted = false; }
    }
})