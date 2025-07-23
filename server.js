const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", (socket) => {
  const { name = "Unnamed", characterName = "Actor1", characterIndex = 0, mapId = 1 } = socket.handshake.query;

  console.log(`✅ Player connected: ${socket.id} (${name})`);

  // Store player data
  players[socket.id] = {
    x: 0,
    y: 0,
    d: 2,
    name,
    characterName,
    characterIndex: parseInt(characterIndex),
    mapId: parseInt(mapId)
  };

  // Send all current players to new client
  socket.emit("init", players);

  // Notify others of new player
  socket.broadcast.emit("player-joined", {
    id: socket.id,
    ...players[socket.id]
  });

  // Update movement
  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = {
        ...players[socket.id],
        x: pos.x,
        y: pos.y,
        d: pos.d,
        mapId: pos.mapId ?? players[socket.id].mapId, // update if provided
        sprint: !!pos.sprint
      };

      socket.broadcast.emit("player-move", {
        id: socket.id,
        ...players[socket.id]
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit("player-left", socket.id);
  });
});

http.listen(3000, () => {
  console.log("🌐 Server listening on port 3000");
});
