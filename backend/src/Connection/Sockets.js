//This file handles connections, adding sockets and players to rooms and client events

const { Socket } = require("socket.io");
const { DoesRoomExist, GenRoomCode, AddRoom } = require("../Rooms/Room");
const { AddPlayer, RemovePlayer, GetPlayerById } = require("../Rooms/Players");
const rooms = require("../Rooms/Rooms");
const { io, GetSockets } = require("./Connection");
const { Player } = require("../Game/Object");

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
    console.log("A player disconnected");

    Leave(socket);
}

function Join(socket, code) {
    console.log("A player joined a room", code, io.sockets.adapter.rooms);

    if (DoesRoomExist(code)) {
        socket.join(code);
        AddPlayer(code, socket.id);

        if (io.sockets.adapter.rooms.get(code).size === 2) {
            io.to(code).emit("join", code);
        }
        else {
            socket.emit("join", code);
        }
    }
    else {
        socket.emit("wrongCode");
    }
}

function Leave(socket) {
    
    const player = GetPlayerById(socket.id);

    if(player instanceof Player)
    {   
        const room_id = player.room;

        RemovePlayer(room_id, socket.id);
        
        let sockets = GetSockets(room_id);
        console.log(sockets, sockets.length);
        
        if (sockets.length === 1) {
            const scene = rooms[room_id].scene;
            const obj = scene.ToMap();
            for(let o in obj)
            {
                obj[o] = {v: []};
            }


            io.to(room_id).emit("wait", room_id);
        }
    }
}

function CreateRoom(socket) {
    const code = GenRoomCode();

    socket.join(code);
    AddRoom(code);
    AddPlayer(code, socket.id);

    socket.emit("wait", code);
}