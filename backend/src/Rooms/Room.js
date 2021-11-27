const { Player, RenderObjects } = require("../Game/Object");
const { io, GetSocket, GetSockets } = require("../Connection/Connection");
const rooms = require("./Rooms");

class Scene {
    constructor() {
        //2d array
        this.obstacles = [];

        this.bullets = [];
        this.players = {};
    }

    ToMap() {
        const obstacles = this.obstacles.map(obstacles => obstacles.reduce((res, obstacle) => {
            res[obstacle.id] = obstacle;
            return res;
        }, {})).reduce((res, obstacles) => ({ ...res, obstacles }), {});

        const bullets = this.bullets.reduce((res, bullet, index) => {
            res[bullet.id] = bullet;
            return res;
        }, {});

        const res = { ...obstacles, ...bullets, ...this.players }

        //console.log("Mapped objects: ", res);

        return res;
    }

    GenEnvironment() {

    }

    GetVertices() {
        let objects = this.ToMap();

        for (let object_id in objects) {
            objects[object_id] = objects[object_id].GetVertices();
        }

        return objects;
    }
}

class Room {
    constructor(id) {
        this.id = id;

        this.scene = new Scene();

        this.hasGameStarted = false;
    }

    AddPlayer(id) {
        this.scene.players[id] = new Player(this.id, id);
    }

    RemovePlayer(id) {
        delete this.scene.players[id];
    }

    GetPlayersCount() {
        return Object.keys(this.scene.players).length;
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

    EmitUpdate
}