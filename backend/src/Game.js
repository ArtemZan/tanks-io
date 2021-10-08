const io = require("./Connection");
let { players, PlayersCount, GetPlayer } = require("./Player");

function GameLoop(timer) {
    UpdatePosition(timer);

    Render();

    timer.setTime((new Date).getTime())
    //io.emit("update", { vertices: [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.0, y: 0.7 }] })
}

async function Render() {

    const sockets = await io.fetchSockets();

    let vertices = [];
    for (let player_id in players) {
        players[player_id].Render(vertices);
    }

    for(let socket of sockets)
    {
        socket.emit("update", { vertices, pos: players[socket.id].pos, dir: players[socket.id].dir });
    }
    //console.log(JSON.stringify(vertices))

}

function UpdatePosition(timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    for (let player_id in players) {
        let player = players[player_id];

        player.pos = player.pos.add(player.dir.scale(player.speed * dTime));
        //console.log(player.dir);
        player.dir = player.dir.rotate(player.rotationSpeed * dTime);
        //console.log(player.rotationSpeed * dTime);
        //console.log(player.dir);
    }

}

module.exports = { GameLoop }