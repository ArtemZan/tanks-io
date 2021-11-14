import { useContext } from "react"
import { gameStateContext } from "../State"

export default function GameUI() {
    const {state} = useContext(gameStateContext);

    return (
        <div className="game-ui">
            <h2>{state.roomCode}</h2>
        </div>
    )
}