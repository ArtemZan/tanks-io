import { AddConnectionListenner, AddEventListenner, Emit } from "../Connection";

import LoseWindow from "./LoseWindow";
import StartWindow from "./StartWindow";
import GameUI from "./GameUI";

import { useEffect, useState } from "react";
import Waiting from "./Waiting";
import { useDispatch, useSelector } from "react-redux";
import { endGame, RootState, setGameUI, setLostUI, setMenuUI, setPlayerId, setRoomCode, setWaitingUI, startGame } from "../Store";
import { UIStateType } from "../Store";
import { LostUIProps, StartWindowProps } from "../Store/UI";

function RenderUI() {
    const ui = useSelector<RootState>(state => state.UIState.type);
    const props = useSelector<RootState>(state => state.UIState.props)

    switch (ui) {
        case UIStateType.MENU:
            {
                return <StartWindow {...props as StartWindowProps} />
            }
        case UIStateType.WAITING:
            {
                return <Waiting />
            }
        case UIStateType.PLAYING:
            {
                return <GameUI />
            }
        case UIStateType.LOST:
            {
                return <LoseWindow {...props as LostUIProps} />
            }
    }
    return <></>;
}

export default function UI() {
    const dispatch = useDispatch();

    const playerId = useSelector<RootState>(state => state.player.id)

    useEffect(() => {
        AddConnectionListenner(() => {

            AddEventListenner("wrongCode", WrongCode);
    
            AddEventListenner("Join", data => {
                const [id, code] = data

                code && dispatch(setRoomCode(code))
                dispatch(setPlayerId(id))
                dispatch(setWaitingUI())
                dispatch(endGame())
            })

            AddEventListenner("GameStarted", () => {
                console.log("The game begins")

                dispatch(setGameUI())
                dispatch(startGame())
            })

            AddEventListenner("GameEnded", () => {
                console.log("The game ends")

                dispatch(setWaitingUI())
                dispatch(endGame())
            })
    
            AddEventListenner("killed", data => {
                console.log("Someone died: ", data);
    
                if (data.id === data.killed) {
                    console.log("I died :(");
    
                    dispatch(setLostUI({score: data.score}))
                }
                else {
                    if (data.playersRemain === 1) {
                        dispatch(setWaitingUI())
                    }
                }
            })
        })

    }, [])

    function WrongCode() {
        console.log("Wrong code");

        dispatch(setMenuUI({error: "There is no room with given code"}))
    }

    return (
        <div className="ui">
            {RenderUI()}
        </div>);
}

export {
    UI
}