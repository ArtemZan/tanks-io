import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import connection from "./Connection"
import room from "./Room"
import { UIState, UIStateType } from "./UI"
import game from "./Game"

const rootReducer = combineReducers({
    connection: connection.reducer,
    room: room.reducer,
    UIState: UIState.reducer,
    game: game.reducer
})

type RootState = ReturnType<typeof rootReducer>;

const store = configureStore<RootState>({
    reducer: rootReducer
});


const actions = {
    connection: connection.actions,
    room: room.actions,
    UIState: UIState.actions,
    game: game.actions,
}

export {
    store,
    actions,
    UIStateType
}

export type { RootState };