import "./Game.css"
import "./Windows/Windows.css"

import { Component, createRef, useEffect, useState } from "react"
import {
    Init as InitDrawingLib,
    DrawTriangles,
    Clear,
    Camera2D,
    vec2,
    vec3,
    ToWindowSpace,
    ToWorldSpace
} from "./Drawing";


import io from "socket.io-client"
import StartWindow from "./Windows/StartWindow";
import { IsKeyDown, IsKeyUp, mousePos } from "./Input";
import UI, { UIStates } from "./Windows/UI";
const socket = io("http://localhost:3000", { transports: ['websocket'] });


export default class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasGameStarted: false,
            UI: { state: UIStates.waitingForPlayers }
        };

        this.canvas = createRef();
        this.camera = new Camera2D;

        this.gameLoopId = -1;

        this.playerId = -1;
        this.playerPos = new vec2(0, 0);
        this.playerDir = new vec2();
        this.currentCameraOffset = new vec2(0, 0);

        this.objects = [];
        this.vertices = [];
        this.keysPressed = [];
    }

    OnGameStarts() {
        console.log("The game begins!");
        this.setState({ hasGameStarted: true });

        this.gameLoopId = setInterval(this.OnLocalUpdate.bind(this), 30);
    }

    OnGameStops() {
        this.setState({ hasGameStarted: false });

        //console.log("You lose or all players left");

        clearInterval(this.gameLoopId);
    }


    OnUpdate(update) {
        //console.log(update.obj);

        if (!(update && update.obj)) {
            console.log("Invalid data received from update");
            return;
        }

        this.playerId = update.id;

        //Update local scene
        for (let obj of update.obj) {
            if (obj.i == this.objects.length) {
                this.objects.push(obj);
            }
            else if (obj.i > this.objects.length) {
                console.log("Couldn't add object at index ", obj.i);
            }
            else {
                if(obj.v)
                {
                    if (obj.v.length) {
                        this.objects[obj.i].v = obj.v;
                    }
                    else {
                        delete this.objects[obj.i];
                    }
                }
            }
        }

        //Remove deleted(undefined) objects
        this.objects = this.objects.filter(el => el);

        //Update vertices
        this.vertices = [];
        for (let o of this.objects) {
            this.vertices.push(...o.v);
        }

        //Update position and direction
        let player = update.obj[update.id];
        let pos = player.pos;
        let dir = player.dir;

        this.playerPos = new vec2(pos.x, pos.y);
        this.playerDir = new vec2(dir.x, dir.y);
    }

    //This function is called independently of updates from server 
    OnLocalUpdate() {
        for (let k in this.keysPressed) {
            if (IsKeyUp(k)) {
                this.keysPressed[k] = false;
            }
        }

        this.SetUpCamera();
        this.Draw();
    }


    OnResize() {
    }

    OnMouseMove(e) {
        if (!this.state.hasGameStarted)
            return;

        this.RotateTurret();
    }

    OnMouseDown(e) {
        if (!this.state.hasGameStarted)
            return;

        let dir = ToWorldSpace({ x: e.x, y: e.y });
        console.log(dir, this.playerPos);
        dir = dir.add(this.currentCameraOffset);
        dir.x *= window.innerWidth / window.innerHeight;
        socket.emit("shoot", dir);
    }

    OnKeyDown(e) {
        this.keysPressed[e.key] = true;

        if (!this.state.hasGameStarted)
            return;

        if (IsKeyDown("w")) {
            socket.emit("startMoving", true);
        }

        if (IsKeyDown("s")) {
            socket.emit("startMoving", false);
        }

        if (IsKeyDown("a")) {
            socket.emit("startRotating", false);
        }

        if (IsKeyDown("d")) {
            socket.emit("startRotating", true);
        }
    }

    OnKeyUp(e) {
        if (IsKeyUp("w") && IsKeyUp("s")) {
            socket.emit("stopMoving");
        }

        if (IsKeyUp("a") && IsKeyUp("d")) {
            socket.emit("stopRotating");
        }
    }

    componentDidMount() {
        InitDrawingLib(this.canvas.current);

        socket.on("start", this.OnGameStarts.bind(this));

        socket.on("join", this.OnGameStarts.bind(this));


        socket.on("end", () => {
            console.log("The game finished!");
            this.OnGameStops();
        })

        socket.on("update", this.OnUpdate.bind(this))

        socket.on("lose", info => {
            this.setState({ UI: { state: UIStates.lost, info } });

            console.log("You lose");

            this.OnGameStops();
        })


        console.log(this.canvas);
        window.addEventListener("resize", this.OnResize.bind(this));
        window.addEventListener("keydown", this.OnKeyDown.bind(this));
        window.addEventListener("keyup", this.OnKeyUp.bind(this));
        window.addEventListener("mousedown", this.OnMouseDown.bind(this));
        window.addEventListener("mousemove", this.OnMouseMove.bind(this));
    }

    componentWillUnmount() {
        //window.removeEventListener("resize", this.OnResize.bind(this));
        //window.romoveEventListener("keydown", this.OnKeyDown.bind(this));
    }

    RotateTurret() {
        let dir = ToWorldSpace(mousePos);
        dir = dir.add(this.currentCameraOffset);
        dir.x *= window.innerWidth / window.innerHeight;
        socket.emit("startRotatingTurret", dir);
    }


    SetUpCamera() {
        let aspect_ratio = window.innerWidth / window.innerHeight;
        this.camera.view.x.x = 2 / aspect_ratio;
        this.camera.view.y.y = 2;

        let offset = this.playerDir.scale(0.1).sub(this.currentCameraOffset);

        const cam_movement_speed = 0.0003;

        if (offset.x > cam_movement_speed)
            this.currentCameraOffset.x += cam_movement_speed;
        else if (offset.x < -cam_movement_speed)
            this.currentCameraOffset.x -= cam_movement_speed;
        else
            this.currentCameraOffset.x += offset.x;

        if (offset.y > cam_movement_speed)
            this.currentCameraOffset.y += cam_movement_speed;
        else if (offset.y < -cam_movement_speed)
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

                {!this.state.hasGameStarted && <UI {...this.state.UI}/>}

                <canvas ref={this.canvas}
                    style={{ visibility: this.state.hasGameStarted ? "visible" : "hidden" }} />
            </div>
        )
    }
}