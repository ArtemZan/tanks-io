import { useState } from "react"
import { Emit } from "../Connection";

export default function StartWindow(props)
{
    let [code, SetCode] = useState("");

    function Join()
    {
        Emit("join", code);
    }

    function CreateRoom()
    {
        Emit("createRoom");
    }

    return(
        <div className = "start-window">
            <h2>Enter code of the room to join</h2>
            <input className = "input" onInput = {e => {SetCode(e.target.value)}}/>
            <button onClick = {Join}>Join</button>
            <p className = "error">{props.error}</p>
            <h2>Or</h2>
            <button onClick = {CreateRoom}>Create new room</button>
        </div>
    )
}