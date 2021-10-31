const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = 3000; // For now

http.listen(PORT, () => {
    console.log(`Listenning on port ${PORT}`);
});

http.addListener("close", () => {
    console.log("Server closed");
})

module.exports = io;