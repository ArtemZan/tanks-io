
document.addEventListener("keydown", e => {
    keysDown[e.key] = true;
})

document.addEventListener("keyup", e => {
    keysDown[e.key] = false;
})


var keysDown = [];
//var keysPressed = [];

const IsKeyDown = key => true && keysDown[key];
const IsKeyUp = key => true && !keysDown[key];

module.exports = {IsKeyDown, IsKeyUp}