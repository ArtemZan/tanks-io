const { vec2 } = require("./Drawing");

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


const keysDown = [];
const mousePos = new vec2(0, 0);

const IsKeyDown = key => true && keysDown[key];
const IsKeyUp = key => true && !keysDown[key];

module.exports = {IsKeyDown, IsKeyUp, mousePos}