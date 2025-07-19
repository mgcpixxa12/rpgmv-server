const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  // Set initial player position
  players[socket.id] = { x: 0, y: 0 };

  // Send current players to the new player
  socket.emit("init", players);

  // Notify others of the new player
  socket.broadcast.emit("player-joined", {
    id: socket.id,
    x: players[socket.id].x,
    y: players[socket.id].y,
  });

  // When a player moves
  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      socket.broadcast.emit("player-move", {
        id: socket.id,
        x: pos.x,
        y: pos.y,
      });
    }
  });

  // When a player disconnects
  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("player-left", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Multiplayer server running.");
});

http.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server is running");
});
