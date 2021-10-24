const { DoesRoomExist, GenRoomCode, AddPlayer, RemovePlayer, GetPlayer, GetPlayerById, rooms, AddRoom } = require("./Room")

const { StartGame, StopGame } = require("./Game");
const io = require("./Connection");


io.on("connection", client => {
    client.on("join", Join.bind(null, client));

    client.on("createRoom", CreateRoom.bind(null, client));

    client.on("disconnect", () => {
        console.log(rooms);

        let player = GetPlayerById(client.id);
        
        if(player)
        {
            RemovePlayer(player.room, client.id);
        }

        console.log("A player disconnected");

        client.leave(client.rooms);
    })


    client.on("startMoving", ahead => {
        GetPlayerById(client.id).StartMoving(ahead);
    })

    client.on("stopMoving", () => {
        GetPlayerById(client.id).StopMoving();
    })

    client.on("startRotating", clockwise => {
        GetPlayerById(client.id).StartRotating(clockwise);
    })

    client.on("stopRotating", () => {
        GetPlayerById(client.id).StopRotating();
    })

    client.on("startRotatingTurret", dir => {
        console.log("Turret of player with id: " + client.id + " started moveing")
        GetPlayerById(client.id).StartRotatingTurret(dir);
    })

    client.on("stopRotatingTurret", () => {
        GetPlayerById(client.id).StopRotatingTurret();
    })


    client.on("shoot", () => {
        GetPlayerById(client.id).Shoot();
    })
})

function Join(client, code) {
    if (DoesRoomExist(code)) {
        client.join(code);
        AddPlayer(code, client.id);

        switch(io.sockets.adapter.rooms.get(code).size)
        {
            case 1: break;
            case 2: io.to(code).emit("join", code); break;
            default: client.emit("join", code);
        }
    }
    else {
        client.emit("wrongCode");
    }
}

function CreateRoom(client) {
    const code = GenRoomCode();

    console.log("Created room with code ", code);

    client.join(code);
    AddRoom(code);
    AddPlayer(code, client.id);

    console.log("Joined player with id: " + client.id)

    client.emit("wait", code);
}