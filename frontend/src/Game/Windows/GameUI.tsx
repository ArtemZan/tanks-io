import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown } from "../../Utilities/Components";
import { Emit } from "../Connection";
import { endGame, RootState, setMenuUI, setRoomCode } from "../Store";

export default function GameUI() {
    const roomCode = useSelector<RootState>(state => state.room.id)
    const playerId = useSelector<RootState>(state => state.player.id) as string
    
    const dispatch = useDispatch()

    const leaveGame = () => {
        dispatch(setRoomCode(null))
        dispatch(setMenuUI({}))
        dispatch(endGame())
        Emit("Leave", playerId, roomCode);

        //window.location.href = window.location.pathname;
    }

    return (
        <div className="game-ui">
            <Dropdown
                className="menu"
                buttonContent={<i className="material-icons hoverable">settings</i>}
                options={[
                    <div className = "room-code">Room code: <strong>{roomCode as string}</strong></div>,
                    <Button onClick = {leaveGame}>Leave</Button>
                ]}/>
        </div>
    )
}