import LoseWindow from "./LoseWindow";
import WaitingWindow from "./StartWindow";

const UIStates = {
    waitingForPlayers: 0,
    lost: 1
}

export default function UI(props)
{
    if(props.state === undefined)
    {
        console.log("State not given in props")
        return null;
    }

    let result = null;

    switch(props.state)
    {
        case UIStates.waitingForPlayers: 
        {
            result = <WaitingWindow />;
            break;
        }
        case UIStates.lost:
            {
                result = <LoseWindow />
                break;
            }
    }

    return result;
}

export {
    UIStates,
    UI
}