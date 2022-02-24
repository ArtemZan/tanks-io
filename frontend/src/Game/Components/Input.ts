import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToWorldSpace, Vec2 } from "../CanvasRendering";
import { AddConnectionListenner, Emit } from "../Connection";
import { actions, RootState } from "../Store";
import { PlayerState } from "../Store/Game/Player";
import Game from "./Game";

document.addEventListener("mousemove", e => {
    mousePos.x = e.x;
    mousePos.y = e.y;
})

document.addEventListener("keydown", e => {
    keysDown[e.key] = true;
})

document.addEventListener("keyup", e => {
    keysDown[e.key] = false;
})


const keysDown: { [key: string]: boolean } = {};
const mousePos = new Vec2(0, 0);

const IsKeyDown = (key: string) => true && keysDown[key];
const IsKeyUp = (key: string) => !IsKeyDown(key);



type InputComponentProps = {
    onMouseMove: (event: MouseEvent) => void
}

function InputComponent(props: InputComponentProps) {
    const dispatch = useDispatch()
    const player = useSelector<RootState>(state => state.game.player) as PlayerState

    useEffect(() => {
        window.addEventListener("keydown", OnKeyDown)
        window.addEventListener("keyup", OnKeyUp)
        window.addEventListener("mousedown", OnMouseDown)
        window.addEventListener("mousemove", OnMouseMove)

        return () => {
            window.removeEventListener("keydown", OnKeyDown)
            window.removeEventListener("keyup", OnKeyUp)
            window.removeEventListener("mousedown", OnMouseDown)
            window.removeEventListener("mousemove", OnMouseMove)
        }
    }, [])

    function OnKeyUp(e: KeyboardEvent) {
        if (e.code === "KeyW" || e.code === "KeyS") {
            Emit("StopMoving");
        }

        if (e.code === "KeyA" || e.code === "KeyD") {
            Emit("StopRotating");
        }
    }

    function OnKeyDown(e: KeyboardEvent) {
        //console.log(e.code)

        if (e.code === "KeyW") {
            dispatch(actions.game.player.setSpeed(player.maxSpeed))
        }
        
        if (e.code === "KeyS") {
            dispatch(actions.game.player.setSpeed(-player.maxSpeed))
        }
        
        if (e.code === "KeyA") {
            dispatch(actions.game.player.setRotationSpeed(player.maxRotationSpeed))
        }

        if (e.code === "KeyD") {
            dispatch(actions.game.player.setRotationSpeed(-player.maxRotationSpeed))
        }
    }

    function OnMouseDown(e: MouseEvent) {
        // let dir = ToWorldSpace(new Vec2(e.x, e.y));
        // dir = dir.add(this.currentCameraOffset);
        // dir.x *= window.innerWidth / window.innerHeight;

        Emit("Shoot");
    }

    function OnMouseMove(e: MouseEvent) {
        props.onMouseMove(e)
    }


    return null;
}


export { IsKeyDown, IsKeyUp, mousePos, InputComponent }