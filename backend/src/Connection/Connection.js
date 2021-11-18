const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = 3000; // For now

http.listen(PORT, () => {
    console.log(`Listenning on port ${PORT}`);
});

function GetSocket(socket_id)
{
    console.log(socket_id, Array.from(io.sockets.sockets).map(s => s[0]));
    return io.sockets.sockets.get(socket_id);
}

function GetSocketsIds(room_id)
{
    return Array.from(io.sockets.adapter.rooms.get(room_id) || [])
}

function GetSockets(room_id)
{
    return GetSocketsIds(room_id).map(id => io.sockets.sockets.get(id));
}

module.exports = {io, GetSocket, GetSockets, GetSocketsIds};