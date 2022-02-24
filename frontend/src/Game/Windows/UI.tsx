import { AddConnectionListenner, AddEventListenner, Emit } from "../Connection";

import LoseWindow from "./LoseWindow";
import StartWindow from "./StartWindow";
import GameUI from "./GameUI";

import { useEffect, useState } from "react";
import Waiting from "./Waiting";
import { useDispatch, useSelector } from "react-redux";
import { RootState, actions } from "../Store";
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

    const playerId = useSelector<RootState>(state => state.connection.id)

    useEffect(() => {
        AddConnectionListenner(() => {

            AddEventListenner("wrongCode", WrongCode);
    
            AddEventListenner("Join", data => {
                const [id, code] = data

                code && dispatch(actions.room.setId(code))
                dispatch(actions.connection.setId(id))
                dispatch(actions.UIState.waiting())
                dispatch(actions.game.end())
            })

            AddEventListenner("GameStarted", () => {
                console.log("The game begins")

                dispatch(actions.UIState.playing())
                dispatch(actions.game.start())
            })

            AddEventListenner("GameEnded", () => {
                console.log("The game ends")

                dispatch(actions.UIState.waiting())
                dispatch(actions.game.end())
            })
    
            AddEventListenner("killed", data => {
                console.log("Someone died: ", data);
    
                if (data.id === data.killed) {
                    console.log("I died :(");
    
                    dispatch(actions.UIState.lost({score: data.score}))
                }
                else {
                    if (data.playersRemain === 1) {
                        dispatch(actions.UIState.waiting())
                    }
                }
            })
        })

    }, [])

    function WrongCode() {
        console.log("Wrong code");

        dispatch(actions.UIState.menu({error: "There is no room with given code"}))
    }

    return (
        <div className="ui">
            {RenderUI()}
        </div>);
}

export {
    UI
}