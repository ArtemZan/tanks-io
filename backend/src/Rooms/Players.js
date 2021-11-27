const rooms = require("../Rooms/Rooms");
const { GetSocket } = require("../Connection/Connection");
const { DoesRoomExist } = require("./Room");

function AddPlayer(room_id, id) {
    rooms[room_id].AddPlayer(id);

    if (rooms[room_id].GetPlayersCount() === 2) {
        rooms[room_id].hasGameStarted = true;
    }

    let obj = rooms[room_id].scene.GetVertices(room_id);

    for(let o in obj)
    {
        obj[o] = {v: obj[o]};
    }

    GetSocket(id).emit("update", { id, obj })
}

function RemovePlayer(room_id, id) {
    if (DoesRoomExist(room_id)) {
        rooms[room_id].RemovePlayer(id);

        if (rooms[room_id].GetPlayersCount() === 1) {
            rooms[room_id].hasGameStarted = false;
        }
    }

    const socket = GetSocket(id);
    socket && socket.leave(room_id);
}

function GetPlayers(room) {
    return rooms[room].scene.players;
}

function GetPlayer(room, id) {
    return GetPlayers(room)[id];
}

function GetPlayerById(id) {
    for (let room in rooms) {
        let player = GetPlayers(room)[id];
        if (player !== undefined) {
            return player;
        }
    }
}

module.exports = {
    AddPlayer, RemovePlayer,
    GetPlayers, GetPlayer, GetPlayerById
}