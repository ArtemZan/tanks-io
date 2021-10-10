const io = require("./Connection");
const { vec2 } = require("./Math");
const { Bullet } = require("./Object");
let { players, PlayersCount, GetPlayer } = require("./Player");

let scene = {
    obstacles: [],
    bullets: []
};


let objectsToBeUpdated = [];


let intervalId;

function StartGame() {
    let timer = new Date();

    intervalId = setInterval(GameLoop.bind(null, timer), 10);

    let i = 0;

    for (let player_id in players) {
        let v = players[player_id].Render();
        objectsToBeUpdated.push({ i, v });

        i++;
    }

    EmitUpdate();
}

function StopGame() {
    clearInterval(intervalId);
}

function MovePlayer(id) {

}

function Shoot(player_id, dir) {
    dir = new vec2(dir.x, dir.y);
    dir = dir.normalize();
    console.log(dir);

    let bullet = new Bullet();

    bullet.dir = dir;
    bullet.pos = players[player_id].pos;
    bullet.speed = 0.001;

    scene.bullets.push(bullet);

}


function GameLoop(timer) {
    objectsToBeUpdated = [];

    UpdatePosition(timer);

    EmitUpdate();

    timer.setTime((new Date).getTime())
    //io.emit("update", { vertices: [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.0, y: 0.7 }] })
}

async function EmitUpdate() {

    if(objectsToBeUpdated.length === 0)
    {
        return;
    }

    const sockets = await io.fetchSockets();

    //console.log(objectsToBeUpdated.length);

    for (let socket of sockets) {
        socket.emit("update", {
            objects: objectsToBeUpdated,
            pos: players[socket.id].pos,
            dir: players[socket.id].dir
        });
    }

}

function UpdatePosition(timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();


    let index = 0;
    for (let player_id in players) {
        let player = players[player_id];

        if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6) {
            player.pos = player.pos.add(player.dir.scale(player.speed * dTime));
            player.dir = player.dir.rotate(player.rotationSpeed * dTime);

            let vertices = player.Render();
            objectsToBeUpdated.push({ i: index, v: vertices });
        }

        index++;
    }


    for (let bullet_i in scene.bullets) {
        let bullet = scene.bullets[bullet_i];
        bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * dTime));
        let vertices = [];

        if (bullet.pos.magnitude() < 10) {
            bullet.Render(vertices);
        }
        else {
            //console.log("Deleted");
            delete scene.bullets[bullet_i];
        }

        objectsToBeUpdated.push({ i: index, v: vertices });

        index++;
    }

    scene.bullets = scene.bullets.filter(el => el);


    //    console.log(objectsToBeUpdated);

}

module.exports = { StartGame, StopGame, Shoot }