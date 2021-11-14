import { AddEventListenner, Emit } from "../Connection";

import LoseWindow from "./LoseWindow";
import StartWindow from "./StartWindow";
import GameUI from "./GameUI";

import { useContext, useEffect, useState } from "react";
import Waiting from "./Waiting";
import { gameStateContext } from "../State";

const UIStates = {
    waitingForPlayers: 0,
    lost: 1,
    playing: 2,
    menu: 3
}

export default function UI(props) {
    let [uiProps, SetUIProps] = useState({});
    let [uiState, SetUIState] = useState(UIStates.menu);

    const { state, SetState, UpdateState } = useContext(gameStateContext);

    useEffect(() => {
        AddEventListenner("wrongCode", WrongCode);

        AddEventListenner("join", code => {
            SetUIProps({ LeaveGame });
            UpdateState({ roomCode: code });
            JoinGame();
        })

        AddEventListenner("wait", code => {
            UpdateState({ roomCode: code });
            SetUIState(UIStates.waitingForPlayers);
            SetUIProps({ code });
        })

        AddEventListenner("killed", data => {
            console.log("Someone died: ", data);

            if (data.id === data.killed) {
                console.log("I died :(");

                SetUIState(UIStates.lost);
                SetUIProps(data.info);
            }
            else {
                if (data.playersRemain === 1) {
                    SetUIState(UIStates.waitingForPlayers);
                }
            }
        })
    }, [])


    let result = null;

    function JoinGame() {
        SetUIState(UIStates.playing);
    }

    function LeaveGame()
    {
        SetUIState(UIStates.menu);
        Emit("leave");
        UpdateState({roomCode: null})
    }

    function WrongCode() {
        console.log("Wrong code");
        SetUIProps({
            ...uiProps,
            error: "There is no room with given code"
        });
    }



    switch (uiState) {
        case UIStates.menu:
            {
                result = StartWindow
                break;
            }
        case UIStates.waitingForPlayers:
            {
                result = Waiting 
                break;
            }
        case UIStates.playing:
            {
                result = GameUI
                break;
            }
        case UIStates.lost:
            {
                result = LoseWindow
                break;
            }
    }

    function FinalIU()
    {
        return result(uiProps)
    }

    return (
        <div className="ui">
            <FinalIU/>
        </div>);
}

export {
    UIStates,
    UI
}