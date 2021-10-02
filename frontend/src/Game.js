import { createRef, useEffect, useState } from "react"
import { Init as InitDrawingLib, DrawTriangles, Clear } from "./DrawingLib";
import "./Game.css"

import io from "socket.io-client"
const socket = io("http://localhost:3000", { transports: ['websocket'] });


function Draw(state)
{
    if(state.vertices)
    {
        Clear("#000000");
        DrawTriangles(state.vertices, "#ffff00");
    }
}


export default function Game() {
    let [gameBegun, GameBegan] = useState(false);
    let canvas = createRef();

    useEffect(() => {
        InitDrawingLib(canvas.current);

        socket.on("start", data => {
            //console.log("connected", data);
            console.log("The game begins!");
            GameBegan(true);
        })

        socket.on("end", () => {
            console.log("The game finished!");
            GameBegan(false);
        })

        socket.on("update", gameState => {
            Draw(gameState);
        })
    }, [])

    return (
        <div className="game">

            {!gameBegun && <h3 className="message message-main">Waiting for the second player...</h3>}

            <canvas ref = {canvas} id="canvas">

            </canvas>
        </div>
    )
}