import { useContext } from "react"
import { Button, Dropdown } from "../../Utilities/Components";
import { gameStateContext } from "../State"

export default function GameUI({LeaveGame}) {
    const { state } = useContext(gameStateContext);

    return (
        <div className="game-ui">
            <Dropdown
                className="menu"
                buttonContent={<i className="material-icons hoverable">settings</i>}
                options={[
                    <div className = "room-code">Room code: <strong>{state.roomCode}</strong></div>,
                    <Button onClick = {LeaveGame}>Leave</Button>
                ]}>

            </Dropdown>
        </div>
    )
}