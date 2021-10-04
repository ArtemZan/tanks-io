let { PlayersCount, AddPlayer, RemovePlayer, GetPlayer } = require("./Game");
let timer = 0;

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

function GameLoop() {
    Render();
    //io.emit("update", { vertices: [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.0, y: 0.7 }] })
}

function Render() {
    let vertices = [];
    for (let player_id = 0; player_id < PlayersCount(); player_id++) {
        GetPlayer(player_id).Render(vertices);
    }

    console.log(JSON.stringify(vertices))
    io.emit("update", { vertices });
}

io.on("connection", client => {
    console.log("New client");

    client.id = PlayersCount();
    AddPlayer();

    if (PlayersCount() === 2) {
        io.emit("start", { pos: { x: 0, y: 0 } });

        timer = setInterval(GameLoop, 3000);
    }

    client.on("disconnect", () => {
        RemovePlayer(client.id);

        console.log("Disconnected,", PlayersCount(), "players remain");

        if (PlayersCount() <= 1) {
            console.log("All players left, the game ends");
            io.emit("end");
            clearInterval(timer);
        }
    })


    client.on("move", ahead => {
        let player = GetPlayer(client.id);

        player.pos += player.dir / 10;

        Render();
    })
})

http.listen(3000, () => {
    console.log("Listenning on port 3000");
});