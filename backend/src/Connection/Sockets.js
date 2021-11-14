//This file handles connections, adding sockets and players to rooms and client events

const { Socket } = require("socket.io");
const { DoesRoomExist, GenRoomCode, AddPlayer, RemovePlayer, GetPlayerById, AddRoom } = require("../Room")
const rooms = require("../Rooms");
const {io} = require("./Connection")

io.on("connection", socket => {
    console.log("New connection");

    socket.on("join", Join.bind(null, socket));

    socket.on("createRoom", CreateRoom.bind(null, socket));

    socket.on("disconnect", Disconnect.bind(null, socket));

    socket.on("leave", Leave.bind(null, socket));


    socket.on("startMoving", ahead => {
        GetPlayerById(socket.id).StartMoving(ahead);
    })

    socket.on("stopMoving", () => {
        GetPlayerById(socket.id).StopMoving();
    })

    socket.on("startRotating", clockwise => {
        GetPlayerById(socket.id).StartRotating(clockwise);
    })

    socket.on("stopRotating", () => {
        GetPlayerById(socket.id).StopRotating();
    })

    socket.on("startRotatingTurret", dir => {
        GetPlayerById(socket.id).StartRotatingTurret(dir);
    })

    socket.on("stopRotatingTurret", () => {
        GetPlayerById(socket.id).StopRotatingTurret();
    })


    socket.on("shoot", () => {
        GetPlayerById(socket.id).Shoot();
    })
})

function Disconnect(socket) {
    let player = GetPlayerById(socket.id);

    if (player) {
        RemovePlayer(player.room, socket.id);
    }

    console.log("A player disconnected");

    socket.leave(socket.rooms);
}

function Join(socket, code) {
    console.log("A player joined a room", code, io.sockets.adapter.rooms);

    if (DoesRoomExist(code)) {
        socket.join(code);
        AddPlayer(code, socket.id);

        switch (io.sockets.adapter.rooms.get(code).size) {
            case 1: break;
            case 2: io.to(code).emit("join", code); break;
            default: socket.emit("join", code);
        }
    }
    else {
        socket.emit("wrongCode");
    }
}

function Leave(socket)
{
    for(let room of socket.rooms)
    {
        RemovePlayer(room, socket.id);
    }
}

function CreateRoom(socket) {
    const code = GenRoomCode();

    socket.join(code);
    AddRoom(code);
    AddPlayer(code, socket.id);

    socket.emit("wait", code);
}