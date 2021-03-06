const { PlayersCount, AddPlayer, RemovePlayer, GetPlayer, StartRotatingPlayer, StopRotatingPlayer } = require("./Player");
const {StartGame, StopGame} = require("./Game");
const {Shoot, StartMovingPlayer, StopMovingPlayer} = require("./Player");
const io = require("./Connection");


io.on("connection", client => {
    console.log("New player,", PlayersCount() + 1, "now");

    AddPlayer(client.id);

    if (PlayersCount() === 2) {
        io.emit("start");
        StartGame();    
    }
    else if(PlayersCount() >= 2)
    {
        client.emit("join");
    }

    client.on("disconnect", () => {
        RemovePlayer(client.id);

        console.log("A player disconnected,", PlayersCount(), "players remain");

        if (PlayersCount() <= 1) {
            console.log("Not enough players, the game ends");
            io.emit("end");

            StopGame();
        }
    })


    client.on("startMoving", ahead => {
        StartMovingPlayer(client.id, ahead);
    })

    client.on("stopMoving", () => {
        StopMovingPlayer(client.id);
    })
    
    client.on("startRotating", clockwise => {
        StartRotatingPlayer(client.id, clockwise);
    })

    client.on("stopRotating", () => {
        StopRotatingPlayer(client.id);
    })


    client.on("shoot", dir => {
        Shoot(client.id, dir);
    })
})
