//This file handles connections, adding sockets and players to rooms and client events

const { DoesRoomExist, GenRoomCode, AddPlayer, RemovePlayer, GetPlayerById, AddRoom } = require("../Room")

const io = require("./Connection")

io.on("connection", client => {
    console.log("New connection");

    client.on("join", Join.bind(null, client));

    client.on("createRoom", CreateRoom.bind(null, client));

    client.on("disconnect", Disconnect.bind(null, client));


    client.on("startMoving", ahead => {
        console.log("Move");
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
        GetPlayerById(client.id).StartRotatingTurret(dir);
    })

    client.on("stopRotatingTurret", () => {
        GetPlayerById(client.id).StopRotatingTurret();
    })


    client.on("shoot", () => {
        GetPlayerById(client.id).Shoot();
    })
})

function Disconnect(client) {
    let player = GetPlayerById(client.id);

    if (player) {
        RemovePlayer(player.room, client.id);
    }

    console.log("A player disconnected");

    client.leave(client.rooms);
}

function Join(client, code) {
    console.log("A player joined a room");

    if (DoesRoomExist(code)) {
        client.join(code);
        AddPlayer(code, client.id);

        switch (io.sockets.adapter.rooms.get(code).size) {
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

    client.join(code);
    AddRoom(code);
    AddPlayer(code, client.id);

    client.emit("wait", code);
}