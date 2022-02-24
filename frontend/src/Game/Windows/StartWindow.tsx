import { useState } from "react"
import { useDispatch } from "react-redux";
import { AddEventListenner, Emit } from "../Connection";
import { actions } from "../Store";
import { StartWindowProps } from "../Store/UI";

export default function StartWindow(props: StartWindowProps) {
    const [code, SetCode] = useState("");
    const dispatch = useDispatch()

    function TryJoin() {
        Emit("Join", code);

        AddEventListenner("Join", (id) => {
            console.log("Joined: " + id)
            dispatch(actions.connection.setId(id))
            dispatch(actions.room.setId(code))

            return 0
        })
    }

    function CreateRoom() {
        Emit("CreateRoom");
    }

    return (
        <div className="start-window">
            <h2>Enter code of the room to join</h2>
            <input className="input" onChange={e => { SetCode(e.target.value) }} />
            <button onClick={TryJoin}>Join</button>
            <p className="error">{props.error}</p>
            <h2>Or</h2>
            <button onClick={CreateRoom}>Create new room</button>
        </div>
    )
}