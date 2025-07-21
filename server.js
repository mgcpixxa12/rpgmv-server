const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);
  players[socket.id] = { x: 0, y: 0, d: 2 };

  socket.emit("init", players);
  socket.broadcast.emit("player-joined", { id: socket.id, ...players[socket.id] });

  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      socket.broadcast.emit("player-move", { id: socket.id, ...pos });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("player-left", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Multiplayer server running.");
});

http.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server is running");
});
