const {Player} = require("./Object");
const {vec2} = require("./Math");
const {Bullet} = require("./Object");
const {scene} = require("./Scene");

const players = {};


function AddPlayer(id)
{
    players[id] = new Player();
}

function RemovePlayer(id)
{
    delete players[id];
}

function GetPlayer(id)
{
    return players[id];
}

function PlayersCount()
{
    return Object.keys(players).length;
}



function StartMovingPlayer(id, ahead) {
    let player = GetPlayer(id);

    player.speed = (ahead ? 1 : -1) * 0.0002;
}

function StopMovingPlayer(id)
{
    let player = GetPlayer(id);

    player.speed = 0;
}


function StartRotatingPlayer(id, clockwise) {
    let player = GetPlayer(id);

    player.rotationSpeed = (clockwise ? -1 : 1) * 0.002;
}

function StopRotatingPlayer(id)
{
    let player = GetPlayer(id);

    player.rotationSpeed = 0;
}


function StartRotatingTurret(id, dir)
{
    let player = GetPlayer(id);

    player.aim = new vec2(dir.x, dir.y).normalize();
}

function StopRotatingTurret(id)
{
    let player = GetPlayer(id);

    player.turretRotationSpeed = 0;
}


function Shoot(player_id) {
    let dir = players[player_id].turretDir;
    dir = dir.normalize();
    console.log(dir);

    let bullet = new Bullet(player_id);

    bullet.dir = dir;
    bullet.pos = players[player_id].pos;
    bullet.speed = 0.001;

    scene.bullets.push(bullet);

}


module.exports = {
    players, AddPlayer, RemovePlayer, PlayersCount, GetPlayer,

    StartMovingPlayer, StopMovingPlayer, 
    StartRotatingPlayer, StopRotatingPlayer, StartRotatingTurret, StopRotatingTurret,
    Shoot
};