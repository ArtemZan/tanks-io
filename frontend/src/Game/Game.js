import { createRef, useEffect, useState } from "react"
import { Init as InitDrawingLib, DrawTriangles, Clear, Camera2D, vec2, vec3 } from "./Drawing";
import "./Game.css"

import io from "socket.io-client"
import StartWindow from "./StartWindow";
const socket = io("http://localhost:3000", { transports: ['websocket'] });


export default function Game() {
    let [hasGameStarted, GameStarted] = useState(false);
    let [canvasSize, SetCanvasSize] = useState(0);
    let [vertices, SetVertices] = useState([]);
    const canvas = createRef();

    const camera = new Camera2D;

    function Draw() {
        if (vertices) {
            camera.view.x.x = window.innerHeight / window.innerWidth;

            if (canvas.current) {
                console.log(canvas.current.width)
                canvas.current.width = window.innerWidth;
                canvas.current.height = window.innerHeight;
            }

            let vert = []

            for (let v in vertices) {
                //console.log(vertices[v]);
                let vertex = new vec3(vertices[v].x, vertices[v].y, 1.0).mult(camera.view);
                vert.push(new vec2(vertex.x, vertex.y));
                //console.log(vertices[v]);
            }



            Clear("#000000");
            DrawTriangles(vert, "#ffff00");
        }
    }

    function OnResize() {


        SetCanvasSize(canvasSize++);
    }


    useEffect(() => {
        InitDrawingLib(canvas.current);

        socket.on("start", data => {
            //console.log("connected", data);
            console.log("The game begins!");
            GameStarted(true);
        })

        socket.on("end", () => {
            console.log("The game finished!");
            GameStarted(false);
        })

        socket.on("update", gameState => {
            SetVertices(gameState.vertices);
        })


        console.log(canvas);
        window.addEventListener("resize", OnResize);

        return () => {
            document.removeEventListener("resize", OnResize);
        }

    }, [])


    useEffect(() => {
        Draw();
    })

    return (
        <div className="game">

            {!hasGameStarted && <StartWindow />}

            <canvas ref={canvas} id="canvas">

            </canvas>
        </div>
    )
}