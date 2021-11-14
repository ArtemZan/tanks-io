const { EmitUpdate } = require("../Room");
const rooms = require("../Rooms");
const {UpdateGame} = require("./GameLogic");

let intervalId;
let timer;

function StartGame() {
    StopGame();


    // for (let roomId in rooms) {
    //     const updatedObjects = rooms[roomId].RenderScene(roomId);

    //     EmitUpdate(roomId, updatedObjects);
    // }


    timer = new Date();

    intervalId = setInterval(UpdateGames.bind(null, timer), 30);
}

function StopGame() {
    intervalId !== undefined && clearInterval(intervalId);
}

//The game loop
function UpdateGames(timer) {
    for (let roomId in rooms) {
        const updatedObjects = UpdateGame(roomId, timer);

        EmitUpdate(roomId, updatedObjects);
    }

    timer.setTime((new Date).getTime());
}

module.exports = {StartGame, StopGame}