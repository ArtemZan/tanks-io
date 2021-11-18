import { AddEventListenner, Emit } from "../Connection";

import LoseWindow from "./LoseWindow";
import StartWindow from "./StartWindow";
import GameUI from "./GameUI";

import { useContext, useEffect, useState } from "react";
import Waiting from "./Waiting";
import { gameStateContext, UIStates } from "../State";

export default function UI(props) {
    let [uiProps, SetUIProps] = useState({});

    const { state, SetState, UpdateState } = useContext(gameStateContext);
    const { ui, roomCode} = state;

    useEffect(() => {
        AddEventListenner("wrongCode", WrongCode);

        AddEventListenner("join", code => {
            SetUIProps({ LeaveGame });
            UpdateState({ roomCode: code });
            JoinGame();
        })

        AddEventListenner("wait", code => {
            UpdateState({ roomCode: code, ui: UIStates.waitingForPlayers });
            SetUIProps({ code });
        })

        AddEventListenner("killed", data => {
            console.log("Someone died: ", data);

            if (data.id === data.killed) {
                console.log("I died :(");

                UpdateState({ui: UIStates.lost});
                SetUIProps(data.info);
            }
            else {
                if (data.playersRemain === 1) {
                    UpdateState({ui: UIStates.waitingForPlayers});
                }
            }
        })
    }, [])


    let result = null;

    function JoinGame() {
        UpdateState({ui: UIStates.playing})
    }

    function LeaveGame()
    {
        UpdateState({roomCode: null, ui: UIStates.menu})
        Emit("leave");

        window.location.href(window.location.pathname);
    }

    function WrongCode() {
        console.log("Wrong code");
        SetUIProps({
            ...uiProps,
            error: "There is no room with given code"
        });
    }



    switch (ui) {
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
        default: result = () => null;
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