import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const enum UIStateType
{
    WAITING,
    LOST,
    PLAYING,
    MENU
}

type LostUIProps = {
    score: number
}

type StartWindowProps = {
    error?: string
}


type UIState = {
    type: UIStateType,
    props?: LostUIProps | StartWindowProps
}

const UIStateSlice = createSlice({
    initialState: {type: UIStateType.MENU} as UIState,
    name: "ui",
    reducers: {
        waiting: state => { state.type = UIStateType.WAITING },
        lost: (state, action: PayloadAction<LostUIProps>) => { 
            state.type = UIStateType.LOST
            state.props = action.payload
        },
        playing: state => { 
            state.type = UIStateType.PLAYING
        },
        menu: (state, action: PayloadAction<StartWindowProps>) => { 
            state.type = UIStateType.MENU
            state.props = action.payload
        }
    }
})

export {
    UIStateSlice as UIState,
    UIStateType
}

export type {
    LostUIProps, StartWindowProps
}