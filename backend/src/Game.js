const io = require("./Connection");
const { DetectCollision } = require("./Math");
const { GetPlayers, rooms, RemovePlayer, GetIndexOfPlayerInRoom } = require("./Room");
const { UpdateObject } = require("./Scene");



let intervalId;
let timer;

function StartGame() {
    timer = new Date();

    intervalId = setInterval(UpdateGameState.bind(null, timer), 10);
}

StartGame();


function StopGame() {
    clearInterval(intervalId);
}

function Explosion(room, updatedObjects, bullet, hit_player_id) {
    let index = 0;

    const players = GetPlayers(room);

    for (let player_id in players) {
        let player = players[player_id];

        let dist = bullet.pos.sub(player.pos).magnitude();

        if (dist < 0.2) {

            //Player near the explosion is also damaged
            player.hp -= (0.2 - (dist < 0.1 ? 0.1 : dist)) * 5;
            if (player_id === hit_player_id) {
                player.hp -= 2;
            }

            console.log(bullet.playerId, hit_player_id);
            
            if (player.hp <= 0) {
                console.log(GetPlayers(room), bullet.playerId);
                KillPlayer(room, updatedObjects, index, GetIndexOfPlayerInRoom(room, bullet.playerId));
            }
        }

        index++;
    }
}

async function KillPlayer(room, updatedObjects, killed_player_ind, killer_ind) {
    
    //RemovePlayer(room, players[killed_player_ind]);
    
    UpdateObject(updatedObjects, killed_player_ind, []);
    
    
    const sockets = await io.fetchSockets(); 
    //Array.from(io.sockets.adapter.rooms.get(room));

    for(let i = 0; i < sockets.length; i++)
    {
        let info = {};
        if(i === killed_player_ind)
        {
            info.info = {score: 0}; // for now always 0
        }

        let assists = {};
        if(i === killer_ind)
        {
            assists.assists = [];
        }

        console.log("Someone died");

        sockets[i].emit("killed", {
            id: i, 
            killed: killed_player_ind, 
            killer: killer_ind, 
            ...info, 
            ...assists}); //No assists for now
    }
}


function UpdateGameState(timer) {
    for (let roomId in rooms) {

        let updatedObjects = {};

        UpdatePhysics(roomId, updatedObjects, timer);

        EmitUpdateToRoom(roomId, updatedObjects);
    }

    timer.setTime((new Date).getTime());
}

async function EmitUpdateToRoom(room, updatedObjects) {
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

function UpdatePhysics(room, updatedObjects, timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    const players = Object.values(GetPlayers(room));

    let playersVert = [];

    let index = 0;
    for (let player_id in players) {
        let player = players[player_id];

        playersVert.push(player.Render());

        if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6 || player.aim.sub(player.turretDir).magnitude() > 1e-2) {
            player.pos = player.pos.add(player.dir.scale(player.speed * dTime));
            player.dir = player.dir.rotate(player.rotationSpeed * dTime);

            let rot_speed = 0;
            if (player.aim.sub(player.turretDir).magnitude() > 1e-2) {
                if (player.aim.cross(player.turretDir).z > 0) {
                    rot_speed = -0.003;
                }
                else {
                    rot_speed = 0.003;
                }
            }

            player.turretDir = player.turretDir.rotate((rot_speed + player.rotationSpeed) * dTime);


            UpdateObject(updatedObjects, index, playersVert[index], { pos: player.pos, dir: player.dir, hp: player.hp });
            //objectsToBeUpdated.push({ i: index, v: playersVert[index] });
        }

        index++;
    }

    let scene = rooms[room].scene;

    for (let bullet_i in scene.bullets) {
        let bullet = scene.bullets[bullet_i];


        bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * dTime));
        let vertices = [];

        if (bullet.pos.magnitude() < 10) {
            vertices = bullet.Render();

            let playerInd = 0;

            for (let playerVert of playersVert) {
                if (players[playerInd].id != bullet.playerId) {
                    let collision = DetectCollision(playerVert, vertices);

                    if (collision) {
                        console.log("Hit");

                        Explosion(room, updatedObjects, bullet, players[playerInd].id);

                        delete scene.bullets[bullet_i];
                        vertices = [];
                    }
                }

                playerInd++;
            }
        }
        else {
            delete scene.bullets[bullet_i];
        }

        UpdateObject(updatedObjects, index, vertices);
        //objectsToBeUpdated.push({ i: index, v: vertices });

        index++;
    }

    scene.bullets = scene.bullets.filter(el => el);


    //console.log(objectsToBeUpdated);

}

module.exports = { StartGame, StopGame }