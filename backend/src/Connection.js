const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

http.listen(3000, () => {
    console.log("Listenning on port 3000");
});

module.exports = io;