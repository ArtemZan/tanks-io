import { AnyAction, combineReducers, createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { Vec2 } from "../../CanvasRendering";
import { PlayerState } from "./Player";
import player from "./Player";

export type GameState = {
    hasStarted: boolean,
    player: PlayerState
}

const slice = createSlice({
    initialState: {} as GameState,
    name: "game",
    reducers: {
        start: state => { state.hasStarted = true },
        end: state => { state.hasStarted = false },
        player: (state, action: AnyAction) => Object.assign(state, player.reducer(state.player, action))
    }
})

let v: ValidateSliceCaseReducers<GameState, typeof slice.caseReducers>

export default {
    actions: {
        ...slice.actions, 
        player: player.actions
    },
    reducer: slice.reducer
}