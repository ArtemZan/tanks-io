const { PlayersCount, AddPlayer, RemovePlayer, GetPlayer } = require("./Player");
const {GameLoop} = require("./Game")
const io = require("./Connection");


io.on("connection", client => {
    console.log("New player");

    let loopId = 0;
    let timer;

    //to do
    const player_id = PlayersCount()

    AddPlayer();

    if (PlayersCount() === 2) {
        io.emit("start", { pos: { x: 0, y: 0 } });

        timer = new Date();
        loopId = setInterval(GameLoop.bind(null, timer), 10);
    }

    client.on("disconnect", () => {
        RemovePlayer(player_id);

        console.log("Disconnected,", PlayersCount(), "players remain");

        if (PlayersCount() <= 1) {
            console.log("All players left, the game ends");
            io.emit("end");
            clearInterval(loopId);
        }
    })


    client.on("startMoving", ahead => {
        let player = GetPlayer(player_id);

        if(!player)
        {
            return;
        }

        player.speed = (ahead ? 1 : -1) * 0.0002;
    })

    client.on("stopMoving", () => {
        let player = GetPlayer(player_id);

        if(!player)
        {
            return;
        }

        player.speed = 0;
    })
    
    client.on("startRotating", clockwise => {
        let player = GetPlayer(player_id);

        if(!player)
        {
            return;
        }

        player.rotationSpeed = (clockwise ? -1 : 1) * 0.005;
    })

    client.on("stopRotating", () => {
        let player = GetPlayer(player_id);

        if(!player)
        {
            return;
        }

        player.rotationSpeed = 0;
    })
})
