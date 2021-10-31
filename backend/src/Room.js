const { Player } = require("./Game/Object");
const io = require("./Connection/Connection");
const rooms = require("./Rooms");

class Room
{
    constructor(id)
    {
        this.id = id;

        this.scene = {
            obstacles: [],
            bullets: [],
            players: {}
        }
    }

    AddPlayer(id)
    {
        this.scene.players[id] = new Player(this.id, id);
    }

    RemovePlayer(id)
    {
        delete this.scene.players[id];
    }
}

function AddRoom(id)
{
    rooms[id] = new Room(id);
}

function DeleteRoom(id)
{
    delete rooms[id];
}

function DoesRoomExist(code) {
    for (let currentCode of io.sockets.adapter.rooms.keys()) {
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

    //Not the best solution
    do {
        code = "";
        for (let c = 0; c < length; c++) {
            code += validSymbols.charAt(Math.floor(Math.random() * validSymbols.length));
        }
    }
    while (DoesRoomExist(code));

    return code;
}


function AddPlayer(room, id)
{
    rooms[room].AddPlayer(id);
}

function RemovePlayer(room, id)
{
    rooms[room].RemovePlayer(id);
}

function GetPlayers(room)
{
    return rooms[room].scene.players;
}

function GetPlayer(room, id)
{
    return GetPlayers(room)[id];
}

function GetIndexOfPlayerInRoom(room, id)
{
    return Object.keys(GetPlayers(room)).indexOf(id);
}

function GetPlayerById(id)
{    
    for(let room in rooms)
    {
        let player = GetPlayers(room)[id];
        if(player !== undefined)
        {
            return player;
        }
    }
}

async function EmitUpdate(room, updatedObjects) {
    if (Object.keys(updatedObjects).length === 0) {
        return;
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(room));


    for (let ind in clients) {
        io.sockets.sockets.get(clients[ind]).emit("update", {
            id: ind,
            obj: updatedObjects
        })
    }
}

module.exports = {
    Room,
    AddRoom,
    DeleteRoom, DoesRoomExist, GenRoomCode, rooms,

    AddPlayer, RemovePlayer, 
    GetPlayers, GetPlayer, GetPlayerById, GetIndexOfPlayerInRoom,

    EmitUpdate
}