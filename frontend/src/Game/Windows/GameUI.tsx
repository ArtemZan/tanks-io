import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown } from "../../Utilities/Components";
import { Emit } from "../Connection";
import { RootState, actions } from "../Store";

export default function GameUI() {
    const roomCode = useSelector<RootState>(state => state.room.id)
    const playerId = useSelector<RootState>(state => state.connection.id) as string
    
    const dispatch = useDispatch()

    const leaveGame = () => {
        dispatch(actions.room.setId(null))
        dispatch(actions.UIState.menu({}))
        dispatch(actions.game.end())
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