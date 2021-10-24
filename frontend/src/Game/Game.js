import "./Game.css"
import "./Windows/Windows.css"

import { Component, createRef } from "react"
import {
    Init as InitDrawingLib,
    DrawTriangles,
    Clear,
    Camera2D,
    vec2,
    vec3,
    ToWorldSpace
} from "./Drawing";


import { IsKeyDown, IsKeyUp, mousePos } from "./Input";
import UI, { UIStates } from "./Windows/UI";
import { AddEventListenner, Connect, Emit } from "./Connection";

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
        this.playerDir = new vec2(0, 0);
        this.currentCameraOffset = new vec2(0, 0);

        this.objects = [];
        this.vertices = [];
        this.keysPressed = [];
    }

    OnConnect()
    {
        AddEventListenner("join", this.OnGameStarts.bind(this))

        AddEventListenner("update", this.OnUpdate.bind(this))

        AddEventListenner("lose", info => {
            this.setState({ UI: { state: UIStates.lost, info } });

            console.log("You lose");

            this.OnGameStops();
        })

    }

    OnGameStarts() {
        console.log("The game begins!");
        this.setState({ hasGameStarted: true, UI: UIStates.playing });

        this.gameLoopId = setInterval(this.OnLocalUpdate.bind(this), 30);
    }

    OnGameStops() {
        this.setState({ hasGameStarted: false });

        //console.log("You lose or all players left");

        clearInterval(this.gameLoopId);
    }


    OnUpdate(update) {
        console.table(update.obj);

        if (!(update && update.obj)) {
            console.log("Invalid data received from update");
            return;
        }

        this.playerId = update.id;

        //Update local scene
        for (let objInd in update.obj) {
            const obj = update.obj[objInd];

            if (this.objects[obj.i] === undefined) {
                this.objects[obj.i] = obj;
            }
            else {
                if (obj.v) {
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

        if (player) {
            if (player.pos) {
                this.playerPos = new vec2(player.pos.x, player.pos.y);
            }

            if (player.dir) {
                this.playerDir = new vec2(player.dir.x, player.dir.y);
            }
        }

        //console.log(this.vertices);
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
        dir = dir.add(this.currentCameraOffset);
        dir.x *= window.innerWidth / window.innerHeight;

        Emit("shoot", dir);
        //socket.emit("shoot", dir);
    }

    OnKeyDown(e) {
        if (!this.state.hasGameStarted)
            return;
            
        this.keysPressed[e.key] = true;

        if (!this.state.hasGameStarted)
            return;

        if (IsKeyDown("w")) {
            Emit("startMoving", true)
        }

        if (IsKeyDown("s")) {
            Emit("startMoving", false);
        }

        if (IsKeyDown("a")) {
            Emit("startRotating", false);
        }

        if (IsKeyDown("d")) {
            Emit("startRotating", true);
        }
    }

    OnKeyUp(e) {
        if (!this.state.hasGameStarted)
            return;

        if (IsKeyUp("w") && IsKeyUp("s")) {
            Emit("stopMoving");
        }

        if (IsKeyUp("a") && IsKeyUp("d")) {
            Emit("stopRotating");
        }
    }

    componentDidMount() {
        InitDrawingLib(this.canvas.current);

        Connect();

        this.OnConnect();
        
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

        Emit("startRotatingTurret", dir);
    }


    SetUpCamera() {
        let aspect_ratio = window.innerWidth / window.innerHeight;
        this.camera.view.x.x = 2 / aspect_ratio;
        this.camera.view.y.y = 2;

        let offset = this.playerDir.scale(0.1).sub(this.currentCameraOffset);

        //console.log(this.playerDir);

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
                //console.log(this.vertices[v], this.camera.view);
                let vertex = new vec3(this.vertices[v].x, this.vertices[v].y, 1.0).mult(this.camera.view);
                vert.push(new vec2(vertex.x, vertex.y));
            }


            //console.log(vert);

            Clear("#000000");
            DrawTriangles(vert, "#ffff00");
        }
    }


    render() {
        return (
            <div className="game">

                <UI {...this.state.UI} />

                <canvas ref={this.canvas}
                    style={{ visibility: this.state.hasGameStarted ? "visible" : "hidden" }} />
            </div>
        )
    }
}