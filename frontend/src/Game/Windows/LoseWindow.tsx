import { useSelector } from "react-redux";
import { Emit } from "../Connection"
import { RootState } from "../Store";

export default function LoseWindow({score}: {score: number})
{
    const roomCode = useSelector<RootState>(state => state.room.id);

    return(
        <div className = "start-window">
            <h3 className="message message-main">You has been killed by ...</h3>
            <h4 className="message message-secondary">Your final score: {score}</h4>
            <button onClick = {() => {
                    Emit("join", roomCode);
                }}>Rejoin</button>
        </div>
    )
}