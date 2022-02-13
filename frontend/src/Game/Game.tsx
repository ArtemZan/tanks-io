import "./Game.css"
import "./Windows/Windows.css"

import React, { Component, createRef } from "react"
import {
    DrawTriangles,
    Clear,
    //Camera2D,
    Vec2,
    Vec3,
    ToWorldSpace,
    setCanvasDimensions,
    SetColor
} from "./CanvasRendering";

import { Camera2D } from "./Camera";


import { IsKeyDown, IsKeyUp, mousePos } from "./Input";
import UI from "./Windows/UI";
import { AddConnectionListenner, AddEventListenner, Emit } from "./Connection";
import { RootState, setPlayerId, startGame } from "./Store";
import { connect, ConnectedProps } from "react-redux";
import { GameObject, ObjectUpdate } from "./GameObjectUpdate";

type PlayerUpdate = {
    pos: Vec2
    dir: Vec2
}

type Update = {
    obj: ObjectUpdate[],
    player: PlayerUpdate
}

type PropsType = ConnectedProps<typeof connector>



class Game extends Component<PropsType> {
    canvas: React.RefObject<HTMLCanvasElement>
    canvasContext?: CanvasRenderingContext2D;
    camera;
    gameLoopTimer?: NodeJS.Timeout;
    playerPos
    playerDir

    currentCameraOffset
    objects: { [id: string]: GameObject } = {}
    vertices: Vec2[] = [];
    keysPressed: { [key: string]: boolean } = {}

    constructor(props: PropsType) {
        super(props);

        this.canvas = createRef();
        this.camera = new Camera2D();

        this.canvas.current && this.canvas.current.getContext("2d")

        this.playerPos = new Vec2(0, 0);
        this.playerDir = new Vec2(0, 0);
        this.currentCameraOffset = new Vec2(0, 0);
    }

    OnConnect() {
        AddEventListenner("GameStarted", this.StartGame.bind(this))

        AddEventListenner("Update", (update: string[]) => {
            this.OnUpdate(JSON.parse(update[0]) as Update)
        })

        AddEventListenner("killed", data => {
            if (data.id === data.killed || data.playersRemain === 1) {
                this.StopGame();
            }
        });

        AddEventListenner("GameEnded", () => {
            this.objects = {}
            this.StopGame()
        })
    }

    StartGame() {
        console.log("The game begins!");
        this.props.startGame();

        this.gameLoopTimer = setInterval(this.OnLocalUpdate.bind(this), 30);
    }

    StopGame() {
        console.log("The game ends");

        this.gameLoopTimer && clearInterval(this.gameLoopTimer);
    }


    OnUpdate(update: Update) {
        console.log("Update: ", update);

        if (this.props.state.player.id === null) {
            console.info("Error: trying to update before setting player's id ('Join' event hasn't been called yet?)")
            return
        }

        if (!(update && update.obj)) {
            console.log("Invalid data received from update");
            return;
        }

        for (let objUpdate of update.obj) {
            if (this.objects[objUpdate.id]) {
                // Update the object
                this.objects[objUpdate.id].update(objUpdate)
            }
            else if ("vert" in objUpdate) {
                // Add new object
                const gameObject = new GameObject(objUpdate.id)
                gameObject.update(objUpdate)
                this.objects[objUpdate.id] = gameObject
            }
            else {
                console.info("Error: trying to transform a game object that doesn't exist. This is probably server error - vertices update should be performed at least once before transform update")
            }
        }



        //Update vertices
        this.vertices = [];
        for (let o of Object.values(this.objects)) {
            this.vertices.push(...o.vertices);
        }

        //Update position and direction
        let player = update.player;

        if (player) {
            if (player.pos) {
                this.playerPos = player.pos;
            }

            if (player.dir) {
                this.playerDir = player.dir.clone();
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

    OnMouseMove(e: MouseEvent) {
        if (!this.props.state.game.hasStarted)
            return

        this.RotateTurret();
    }

    OnMouseDown(e: MouseEvent) {
        if (!this.props.state.game.hasStarted)
            return;

        // let dir = ToWorldSpace(new Vec2(e.x, e.y));
        // dir = dir.add(this.currentCameraOffset);
        // dir.x *= window.innerWidth / window.innerHeight;

        Emit("Shoot");
    }

    OnKeyDown(e: KeyboardEvent) {
        this.keysPressed[e.key] = true;

        if (!this.props.state.game.hasStarted)
            return;

        if (IsKeyDown("w")) {
            Emit("StartMoving", true)
        }

        if (IsKeyDown("s")) {
            Emit("StartMoving", false);
        }

        if (IsKeyDown("a")) {
            Emit("StartRotating", false);
        }

        if (IsKeyDown("d")) {
            Emit("StartRotating", true);
        }
    }

    OnKeyUp(e: KeyboardEvent) {
        if (!this.props.state.game.hasStarted)
            return;

        if (IsKeyUp("w") && IsKeyUp("s")) {
            Emit("StopMoving");
        }

        if (IsKeyUp("a") && IsKeyUp("d")) {
            Emit("StopRotating");
        }
    }

    OnCanvasResize() {
        if (this.canvas.current) {
            setCanvasDimensions(parseInt(getComputedStyle(this.canvas.current).width), parseInt(getComputedStyle(this.canvas.current).height));
        }
    }

    componentDidMount() {
        //Temporary

        if (this.canvas.current) {
            const context = this.canvas.current.getContext("2d")

            this.canvas.current.width = parseInt(getComputedStyle(this.canvas.current).width)
            this.canvas.current.height = parseInt(getComputedStyle(this.canvas.current).height)

            if (context)
                this.canvasContext = context

            setCanvasDimensions(parseInt(getComputedStyle(this.canvas.current).width), parseInt(getComputedStyle(this.canvas.current).height));
            this.canvas.current.addEventListener("resize", this.OnCanvasResize.bind(this))
        }

        AddConnectionListenner(this.OnConnect.bind(this));

        window.addEventListener("resize", this.OnResize.bind(this));
        window.addEventListener("keydown", this.OnKeyDown.bind(this));
        window.addEventListener("keyup", this.OnKeyUp.bind(this));
        window.addEventListener("mousedown", this.OnMouseDown.bind(this));
        window.addEventListener("mousemove", this.OnMouseMove.bind(this));
    }


    componentDidUpdate() {
        if (this.props.state.room.id === null && this.props.state.game.hasStarted) {
            this.StopGame();
        }
    }

    componentWillUnmount() {
        this.canvas.current?.removeEventListener("resize", this.OnCanvasResize)
    }

    RotateTurret() {
        let dir = ToWorldSpace(mousePos);
        dir = dir.add(this.currentCameraOffset);
        dir.x *= window.innerWidth / window.innerHeight;

        Emit("StartRotatingTurret", dir);
    }


    SetUpCamera() {
        let aspect_ratio = window.innerWidth / window.innerHeight;
        this.camera.view.i.x = 0.1 / aspect_ratio;
        this.camera.view.j.y = 0.1;

        let offset = this.playerDir.scale(0.1).sub(this.currentCameraOffset);
        offset = new Vec2(0, 0);

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


        this.currentCameraOffset = new Vec2()

        this.camera.view.k = new Vec2(
            -this.playerPos.x * 2 / aspect_ratio - this.currentCameraOffset.x,
            -this.playerPos.y * 2 - this.currentCameraOffset.y
        );
    }

    Draw() {
        if (!this.canvasContext || !this.vertices || !this.canvas.current) {
            return
        }

        let vert = []

        for (let v in this.vertices) {
            const vertex = new Vec3(this.vertices[v].x, this.vertices[v].y, 1.0).multiply(this.camera.view);
            vert.push(vertex as Vec2);
        }

        //console.log(vert)

        SetColor(this.canvasContext, "#000000");
        Clear(this.canvasContext);
        DrawTriangles(this.canvasContext, vert, "#ffff00");
    }


    render() {
        return (
            <div className="game">

                <UI />

                <canvas ref={this.canvas}
                    style={{ visibility: this.props.state.game.hasStarted ? "visible" : "hidden" }} />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({ state }),
    {
        startGame
    }
);

export default connector(Game);