import { AddEventListenner, Emit } from "../Connection";

import LoseWindow from "./LoseWindow";
import StartWindow from "./StartWindow";
import GameUI from "./GameUI";

import { useEffect, useState } from "react";
import Waiting from "./Waiting";

const UIStates = {
    waitingForPlayers: 0,
    lost: 1,
    playing: 2,
    start: 3
}

export default function UI(props) {
    let [error, DisplayError] = useState(false);
    let [code, SetRoomCode] = useState("");
    let [state, SetUIState] = useState(UIStates.start);

    useEffect(() => {
        AddEventListenner("wrongCode", WrongCode);

        AddEventListenner("join", code => {
            SetRoomCode(code);
            JoinGame();
        })

        AddEventListenner("wait", code => {
            SetRoomCode(code);
            SetUIState(UIStates.waitingForPlayers)
        })
    }, [])

    // if (props.state === undefined) {
    //     console.log("State not given in props")wa
    //     return null;
    // }

    let result = null;

    function JoinGame() {
        DisplayError(false);
        SetUIState(UIStates.playing);
    }

    function Join(code) {
        Emit("join", code);
    }

    function CreateRoom() {
        Emit("createRoom");
    }

    function WrongCode() {
        console.log("error");
        DisplayError(true);
    }



    switch (state) {
        case UIStates.start:
            {
                result = <StartWindow error={error ? "There is no room with given code" : ""} CreateRoom={CreateRoom} Join={Join} {...(props.props ? props.props : {})} />;
                break;
            }
        case UIStates.waitingForPlayers:
            {
                result = <Waiting code = {code} />
                break;
            }
        case UIStates.playing:
            {
                result = <GameUI code = {code} />
                break;
            }
        case UIStates.lost:
            {
                result = <LoseWindow {...(props.props ? props.props : {})} />;
                break;
            }
    }

    return (
    <div className = "ui">
        {result}
    </div>);
}

export {
    UIStates,
    UI
}