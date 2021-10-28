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
    let [code, SetRoomCode] = useState("");
    let [uiProps, SetUIProps] = useState({
        CreateRoom,
        Join
    });
    let [state, SetUIState] = useState(UIStates.start);

    useEffect(() => {
        AddEventListenner("wrongCode", WrongCode);

        AddEventListenner("join", code => {
            SetRoomCode(code);
            JoinGame();
        })

        AddEventListenner("wait", code => {
            SetRoomCode(code);
            SetUIState(UIStates.waitingForPlayers);
            SetUIProps({code});
        })

        AddEventListenner("killed", data => {
            console.log("Someone died: ", data);

            if(data.id === data.killed)
            {
                console.log("I died :(");

                SetUIState(UIStates.lost);
                SetUIProps(data.info);
            }
        })
    }, [])


    let result = null;

    function JoinGame() {
        SetUIProps({code});
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
        SetUIProps({
            ...uiProps,
            error: "There is no room with given code"
        });
    }



    switch (state) {
        case UIStates.start:
            {
                result = <StartWindow {...uiProps} />;
                break;
            }
        case UIStates.waitingForPlayers:
            {
                result = <Waiting {...uiProps} />
                break;
            }
        case UIStates.playing:
            {
                result = <GameUI {...uiProps} />
                break;
            }
        case UIStates.lost:
            {
                result = <LoseWindow {...uiProps} />;
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