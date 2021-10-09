const {Player} = require("./Object");

let players = {};


function AddPlayer(id)
{
    players[id] = new Player();
}

function RemovePlayer(id)
{
    console.log(players);
    delete players[id];
    console.log(players);
}

function GetPlayer(id)
{
    return players[id];
}

function PlayersCount()
{
    return Object.keys(players).length;
}

module.exports = {players, AddPlayer, RemovePlayer, PlayersCount, GetPlayer};