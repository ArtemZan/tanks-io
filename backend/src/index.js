const { 
    PlayersCount, AddPlayer, RemovePlayer, 
    StartRotatingPlayer, StopRotatingPlayer, StartRotatingTurret, StopRotatingTurret,
    Shoot, StartMovingPlayer, StopMovingPlayer
} = require("./Player");

const {StartGame, StopGame} = require("./Game");
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

    client.on("startRotatingTurret", dir => {
        StartRotatingTurret(client.id, dir);
    })
    
    client.on("stopRotatingTurret", () => {
        StopRotatingTurret(client.id);
    })


    client.on("shoot", () => {
        Shoot(client.id);
    })
})
