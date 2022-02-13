import { Vec2 } from "./CanvasRendering";

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


const keysDown: {[key: string]: boolean} = {};
const mousePos = new Vec2(0, 0);

const IsKeyDown = (key: string) => true && keysDown[key];
const IsKeyUp = (key: string) => !IsKeyDown(key);

export {IsKeyDown, IsKeyUp, mousePos}