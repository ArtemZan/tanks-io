import { createContext, useState } from "react"

export const gameStateContext = createContext({state: {}, UpdateState: () => {}, SetState: () => {}});

export function GameStateProvider(props)
{
    const [state, SetState] = useState({});

    function UpdateState(new_state)
    {
        SetState({...state, ...new_state});
    }

    return(
        <gameStateContext.Provider value = {{state, UpdateState, SetState}}>
            {props.children}
        </gameStateContext.Provider>
    )
}