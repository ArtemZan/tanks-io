import { Component, createRef, useEffect, useState } from "react"
import { Init as InitDrawingLib, DrawTriangles, Clear, Camera2D, vec2, vec3 } from "./Drawing";
import "./Game.css"

import io from "socket.io-client"
import StartWindow from "./StartWindow";
import { IsKeyDown, IsKeyUp } from "./Input";
const socket = io("http://localhost:3000", { transports: ['websocket'] });


export default class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasGameStarted: false
        };

        this.canvas = createRef();
        this.camera = new Camera2D;
        this.playerPos = new vec2();
        this.playerDir = new vec2();
        this.currentCameraOffset = new vec2(0, 0);
        this.vertices = [];
        this.keysPressed = [];
    }

    OnGameStarts()
    {
        console.log("The game begins!");
        this.setState({hasGameStarted: true});
    }


    OnResize() {
    }

    OnKeyDown(e)
    {
        this.keysPressed[e.key] = true;

        if(IsKeyDown("w"))
        {
            socket.emit("startMoving", true);
        }

        if(IsKeyDown("s"))
        {
            socket.emit("startMoving", false);
        }
        
        if(IsKeyDown("a"))
        {
            socket.emit("startRotating", false);
        }

        if(IsKeyDown("d"))
        {
            socket.emit("startRotating", true);
        }
    }

    OnKeyUp(e)
    {
        if(IsKeyUp("w") && IsKeyUp("s"))
        {
            socket.emit("stopMoving");
        }
                
        if(IsKeyUp("a") && IsKeyUp("d"))
        {
            socket.emit("stopRotating");
        }
    }

    componentDidMount() {
        InitDrawingLib(this.canvas.current);

        socket.on("start", data => {
            //console.log("connected", data);
            this.OnGameStarts();
        })

        socket.on("join", () => {
            this.OnGameStarts();
        })

        socket.on("end", () => {
            console.log("The game finished!");
            this.setState({hasGameStarted: false});
        })

        socket.on("update", gameState => {
            //console.log(gameState.pos.y);

            this.vertices = gameState.vertices;
            this.playerPos = new vec2(gameState.pos.x, gameState.pos.y);
            this.playerDir = new vec2(gameState.dir.x, gameState.dir.y);

            for(let k in this.keysPressed)
            {
                if(IsKeyUp(k))
                {
                    this.keysPressed[k] = false;
                }
            }

            this.SetUpCamera();
            this.Draw();
        })


        console.log(this.canvas);
        window.addEventListener("resize", this.OnResize.bind(this));
        window.addEventListener("keydown", this.OnKeyDown.bind(this));
        window.addEventListener("keyup", this.OnKeyUp.bind(this));
    }

    componentWillUnmount() {
        //window.removeEventListener("resize", this.OnResize.bind(this));
        //window.romoveEventListener("keydown", this.OnKeyDown.bind(this));
    }


    SetUpCamera()
    {
        let aspect_ratio = window.innerWidth / window.innerHeight;
        this.camera.view.x.x = 2 / aspect_ratio;
        this.camera.view.y.y = 2;

        let offset = this.playerDir.scale(0.1).sub(this.currentCameraOffset);

        const cam_movement_speed = 0.0003;

        if(offset.x > cam_movement_speed)
            this.currentCameraOffset.x += cam_movement_speed;
        else if(offset.x < -cam_movement_speed)
            this.currentCameraOffset.x -= cam_movement_speed;
        else
            this.currentCameraOffset.x += offset.x;

        if(offset.y > cam_movement_speed)
            this.currentCameraOffset.y += cam_movement_speed;
        else if(offset.y < -cam_movement_speed)
            this.currentCameraOffset.y -= cam_movement_speed;
        else
            this.currentCameraOffset.y += offset.y;

        this.camera.view.z = new vec3(
            -this.playerPos.x * 2 / aspect_ratio - this.currentCameraOffset.x, 
            -this.playerPos.y * 2 - this.currentCameraOffset.y, 
            1);
    }

    Draw() {
        if (this.vertices) {
            if (this.canvas.current) {
                this.canvas.current.width = window.innerWidth;
                this.canvas.current.height = window.innerHeight;
            }

            let vert = []

            for (let v in this.vertices) {
                //console.log(vertices[v]);
                let vertex = new vec3(this.vertices[v].x, this.vertices[v].y, 1.0).mult(this.camera.view);
                vert.push(new vec2(vertex.x, vertex.y));
                //console.log(vertices[v]);
            }



            Clear("#000000");
            DrawTriangles(vert, "#ffff00");
        }
    }


    render() {

        return (
            <div className="game">

                {!this.state.hasGameStarted && <StartWindow />}

                <canvas ref={this.canvas} 
                style = {{visibility: this.state.hasGameStarted ? "visible" : "hidden"}}/>
            </div>
        )
    }
}