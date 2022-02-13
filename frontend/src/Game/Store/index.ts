import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import player from "./Player"
import room from "./Room"
import { UIState, UIStateType } from "./UI"
import game from "./Game"


const rootReducer = combineReducers({
    player: player.reducer,
    room: room.reducer,
    UIState: UIState.reducer,
    game: game.reducer
})

type RootState = ReturnType<typeof rootReducer>;

const store = configureStore<RootState>({
    reducer: rootReducer
});

const setPlayerId = player.actions.setId;

const setRoomCode = room.actions.setId;

const setWaitingUI = UIState.actions.waiting
const setLostUI = UIState.actions.lost
const setMenuUI = UIState.actions.menu
const setGameUI = UIState.actions.playing

const startGame = game.actions.start
const endGame = game.actions.end

export { 
    store, 
    setPlayerId, 
    setRoomCode, 
    setWaitingUI, setLostUI, setMenuUI, setGameUI, 
    UIStateType,
    startGame,
    endGame    
};

export type { RootState };