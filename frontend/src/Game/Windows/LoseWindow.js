import { useContext } from "react"
import { Emit } from "../Connection"
import { gameStateContext } from "../State"

export default function LoseWindow({score})
{
    const {state} = useContext(gameStateContext);

    return(
        <div className = "start-window">
            <h3 className="message message-main">You has been killed by ...</h3>
            <h4 className="message message-secondary">Your final score: {score}</h4>
            <button onClick = {() => {
                    Emit("join", state.roomCode);
                }}>Rejoin</button>
        </div>
    )
}