const io = require("./Connection");
const { vec2, DetectCollision } = require("./Math");
const { Bullet } = require("./Object");
const { GetPlayers, rooms } = require("./Room");
const { scene, objectsToBeUpdated, UpdateObject } = require("./Scene");



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

function Explosion(bullet, hit_player_id) {
    console.log("Player died");

    let index = 0;

    for (let player_id in players) {
        let player = players[player_id];

        let dist = bullet.pos.sub(player.pos).magnitude();

        if (dist < 0.2) {

            //Player near the explosion is also damaged
            player.hp -= (0.2 - (dist < 0.1 ? 0.1 : dist)) * 5;
            if (player_id === hit_player_id) {
                player.hp -= 2;
            }

            if (player.hp <= 0) {
                KillPlayer(player_id);
                UpdateObject(index, []);
                //objectsToBeUpdated[index] = {v: []};
            }
        }

        index++;
    }
}

async function KillPlayer(player_id) {
    const sockets = await io.fetchSockets();

    let socket;
    let playerIndex = 0;

    for (let s of sockets) {
        if (s.id === player_id) {
            socket = s;
            break;
        }

        playerIndex++;
    }

    if (!socket) {
        console.log("Failed to kill player: socket with given id doesn't exist");
        return;
    }

    UpdateObject(playerIndex, []);

    delete players[player_id];

    socket.emit("lose", { score: 0 });
}


function UpdateGameState(timer) {
    for (let roomId in rooms) {

        let updatedObjects = {};

        UpdatePhysics(roomId, updatedObjects, timer);

        EmitUpdateToRoom(roomId, updatedObjects);
    }

    timer.setTime((new Date).getTime());
}

function EmitUpdateToRoom(id, updatedObjects)
{
    if (Object.keys(updatedObjects).length === 0) {
        return;
    }

    let index = 0;

    io.to(id).emit("update", {
        id: index,
        obj: updatedObjects
    })

    index++;
}

function UpdatePhysics(room, updatedObjects, timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    const players = GetPlayers(room);

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

    let playerIds = Object.keys(players);

    for (let bullet_i in scene.bullets) {
        let bullet = scene.bullets[bullet_i];


        bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * dTime));
        let vertices = [];

        if (bullet.pos.magnitude() < 10) {
            vertices = bullet.Render();

            let playerInd = 0;
            for (let playerVert of playersVert) {
                if (playerIds[playerInd] != bullet.playerId) {
                    let collision = DetectCollision(playerVert, vertices);

                    if (collision) {
                        console.log("Hit");

                        Explosion(bullet, playerIds[playerInd]);

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

        UpdateObject(index, vertices);
        //objectsToBeUpdated.push({ i: index, v: vertices });

        index++;
    }

    scene.bullets = scene.bullets.filter(el => el);


    //console.log(objectsToBeUpdated);

}

module.exports = { StartGame, StopGame }