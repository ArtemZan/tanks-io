const io = require("./Connection");
let { players, PlayersCount, GetPlayer } = require("./Player");

function GameLoop(timer) {
    UpdatePosition(timer);

    Render();

    timer.setTime((new Date).getTime())
    //io.emit("update", { vertices: [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.0, y: 0.7 }] })
}

function Render() {
    let vertices = [];
    for (let player_id in players) {
        players[player_id].Render(vertices);
    }

    //console.log(JSON.stringify(vertices))
    io.emit("update", { vertices });
}

function UpdatePosition(timer)
{
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

module.exports = {GameLoop}