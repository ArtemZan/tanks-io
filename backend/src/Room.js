const { Player, RenderObjects } = require("./Game/Object");
const { io, GetSocket, GetSockets } = require("./Connection/Connection");
const rooms = require("./Rooms");

class Room {
    constructor(id) {
        this.id = id;

        this.scene = {
            obstacles: [],
            bullets: [],
            players: {}
        }
    }

    AddPlayer(id) {
        this.scene.players[id] = new Player(this.id, id);
    }

    RemovePlayer(id) {
        delete this.scene.players[id];
    }

    RenderScene() {
        const scene = this.scene;

        let renderedScene = {}

        const players = RenderObjects(scene.players);
        const other = RenderObjects([...scene.bullets, ...scene.obstacles]);

        renderedScene = { ...players, ...other };

        for(let id in renderedScene)
        {
            renderedScene[id] = {v: renderedScene[id]};
        }

        return renderedScene;
    }
}

function AddRoom(id) {
    rooms[id] = new Room(id);
}

function DeleteRoom(id) {
    delete rooms[id];

    GetSockets(id).forEach(socket => void socket.leave(id));
}

function DoesRoomExist(code) {
    for (let currentCode in rooms) {
        if (currentCode === code) {
            return true;
        }
    }

    return false;
}

function GenRoomCode() {
    const validSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const length = 6;

    let code;

    do {
        code = "";
        for (let c = 0; c < length; c++) {
            code += validSymbols.charAt(Math.floor(Math.random() * validSymbols.length));
        }
    }
    while (DoesRoomExist(code));

    return code;
}


function AddPlayer(room_id, id) {
    rooms[room_id].AddPlayer(id);

    GetSocket(id).emit("update", {
        id: id,
        obj: rooms[room_id].RenderScene(room_id)
    })
}

function RemovePlayer(room_id, id) {
    if(DoesRoomExist(room_id))
    {
        rooms[room_id].RemovePlayer(id);
    }

    GetSocket(id).leave(room_id);
}

function GetPlayers(room) {
    return rooms[room].scene.players;
}

function GetPlayer(room, id) {
    return GetPlayers(room)[id];
}

function GetIndexOfPlayerInRoom(room, id) {
    return Object.keys(GetPlayers(room)).indexOf(id);
}

function GetPlayerByIndex(room_id, index) {
    return Object.values(GetPlayers(room_id))[index];
}

function GetPlayerById(id) {
    for (let room in rooms) {
        let player = GetPlayers(room)[id];
        if (player !== undefined) {
            return player;
        }
    }
}

async function EmitUpdate(room_id, updatedObjects) {
    if (Object.keys(updatedObjects).length === 0) {
        return;
    }

    const sockets = GetSockets(room_id)

    for (let socket of sockets) {
        socket.emit("update", {
            id: socket.id,
            obj: updatedObjects
        })
    }
}

module.exports = {
    Room,
    AddRoom,
    DeleteRoom, DoesRoomExist, GenRoomCode, rooms,

    AddPlayer, RemovePlayer,
    GetPlayers, GetPlayer, GetPlayerById, GetIndexOfPlayerInRoom, GetPlayerByIndex,

    EmitUpdate
}