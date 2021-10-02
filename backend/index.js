let { PlayersCount, AddPlayer, RemovePlayer } = require("./Game");
let timer = 0;

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", client => {
    console.log("New client");

    AddPlayer();

    if(PlayersCount() === 2)
    {
        io.emit("start", {pos: {x: 0, y: 0}});

        timer = setInterval(() => {
            io.emit("update", {vertices: [{x: -0.5, y: -0.5}, {x: 0.5, y: -0.5}, {x: 0.0, y: 0.7}]})
        }, 1000);
    }

    client.on("disconnect", () => {
        RemovePlayer(client.number);

        console.log("Disconnected,", PlayersCount(), "players remain");

        if(PlayersCount() <= 1)
        {
            console.log("All players left, the game ends");
            io.emit("end");
            clearInterval(timer);
        }
    })
})

http.listen(3000, () => {
    console.log("Listenning on port 3000");
});