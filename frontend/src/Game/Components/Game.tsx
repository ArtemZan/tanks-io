import "../Game.css"
import "../Windows/Windows.css"

import { Component, createRef } from "react"
import {
    Vec2,
    ToWorldSpace,
} from "../CanvasRendering";

import { Camera } from "../Camera";


import { InputComponent, mousePos } from "./Input";
import { AddConnectionListenner, AddEventListenner, Emit } from "../Connection";
import { RootState, actions } from "../Store";
import { connect, ConnectedProps } from "react-redux";
import { ObjectUpdate } from "../GameObjectUpdate";
import Canvas, { Actions as CanvasActions } from "./Canvas";
import { Player } from "../Player";
import scene from "../Scene";

type PropsType = ConnectedProps<typeof connector>


class Game extends Component<PropsType> {
    camera = new Camera();
    player = new Player();
    canvasActions: CanvasActions = {}
    game = createRef<HTMLDivElement>()


    constructor(props: PropsType) {
        super(props);
    }

    StartGame() {
        this.OnLocalUpdate()
    }


    OnUpdate() {
        //console.log("Update: ", update);

        scene.update();

        this.canvasActions.updateVertices && this.canvasActions.updateVertices(scene.getVertices())

        /*
        if (this.props.state.connection.id === null) {
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
        this.canvasActions.updateVertices && this.canvasActions.updateVertices(() => {
            let vertices = [];
            for (let o of Object.values(this.objects)) {
                vertices.push(...o.vertices);
            }

            return vertices;
        })


        //Update position and direction
        let player = update.player;

        if (player) {
            if (player.pos) {
                this.player.pos = player.pos;
            }

            if (player.dir) {
                this.player.dir = Vec2.clone(player.dir);
            }
        } 
        */

        //console.log(this.vertices);
    }

    //This function is called independently of updates from server 
    OnLocalUpdate() {
        if (this.props.state.game.hasStarted) {

            const { width, height } = getComputedStyle(this.game.current?.getElementsByTagName("canvas")[0] as HTMLCanvasElement)
            this.camera.Update(this.player, parseFloat(width) / parseFloat(height));
            //this.Draw();

            if (this.props.state.game.hasStarted) {
                requestAnimationFrame(() => { this.OnLocalUpdate() })
            }
        }
    }

    OnMouseMove(e: MouseEvent) {
        this.RotateTurret();
    }

    RotateTurret() {
        let dir = ToWorldSpace(mousePos);
        dir = dir.add(this.camera.offset);
        dir.x *= window.innerWidth / window.innerHeight;
        dir = dir.normalize();


        Emit("StartRotatingTurret", JSON.stringify(dir));
    }


    componentDidMount() {
        this.StartGame();

        // AddEventListenner("Update", (update: string) => {
        //     this.OnUpdate(JSON.parse(update[0]) as Update)
        // })

        AddEventListenner("killed", data => {
            if (data.id === data.killed || data.playersRemain === 1) {
                this.props.endGame();
            }
        });

        AddEventListenner("GameEnded", () => {
            this.props.endGame();
        })
    }

    componentWillUnmount() {
        this.props.endGame();
    }

    componentDidUpdate() {
        // if (this.props.state.room.id === null && this.props.state.game.hasStarted) {
        //     this.StopGame();
        // }
    }


    render() {
        console.log("HasGameStarted: " + this.props.state.game.hasStarted)

        return (
            <div className="game" ref={this.game}>
                {this.props.state.game.hasStarted && <InputComponent onMouseMove={this.OnMouseMove.bind(this)} />}

                {this.props.state.game.hasStarted && <Canvas onResize={size => { this.camera.Update(this.player, size.x / size.y) }} camera={this.camera} actions={this.canvasActions} />}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({ state }),
    {
        startGame: actions.game.start,
        endGame: actions.game.end
    }
);

export default connector(Game);