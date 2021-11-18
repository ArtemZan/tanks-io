import { createContext, useState } from "react"
import { GetParam } from "../Utilities/URL";
import {Emit} from "./Connection";

export const UIStates = {
    waitingForPlayers: 0,
    lost: 1,
    playing: 2,
    menu: 3
}

const defaultState = {roomCode: null, ui: UIStates.menu}

export const gameStateContext = createContext({state: defaultState, UpdateState: () => {}, SetState: () => {}});

export function GameStateProvider(props)
{
    const [state, SetState] = useState(defaultState);

    let currentState = {...state};

    if(!state.roomCode)
    {
        const roomCode = GetParam(window.location.toString(), "room_code")
        
        if(roomCode !== undefined)
        {
            console.log(roomCode);
            Emit("join", roomCode);
        }
    }

    function UpdateState(new_state)
    {
        //console.log(currentState);
        currentState = {...currentState, ...new_state};
        //console.log(state, new_state, currentState);
        SetState(currentState);
    }

    return(
        <gameStateContext.Provider value = {{state, UpdateState, SetState}}>
            {props.children}
        </gameStateContext.Provider>
    )
}