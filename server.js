const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", (socket) => {
  const { name = "Unnamed", characterName = "Actor1", characterIndex = 0, mapId = 1 } = socket.handshake.query;

  players[socket.id] = {
    x: 0,
    y: 0,
    d: 2,
    sprint: false,
    name,
    characterName,
    characterIndex: parseInt(characterIndex),
    mapId: parseInt(mapId)
  };

  console.log(`✅ ${name} connected`);

  socket.emit("init", players);

  socket.broadcast.emit("player-joined", {
    id: socket.id,
    ...players[socket.id]
  });

  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = {
        ...players[socket.id],
        x: pos.x,
        y: pos.y,
        d: pos.d,
        sprint: !!pos.sprint,
        mapId: pos.mapId
      };
      socket.broadcast.emit("player-move", {
        id: socket.id,
        ...players[socket.id]
      });
    }
  });

  socket.on("chat", (data) => {
    io.emit("chat", {
      id: socket.id,
      msg: data.msg
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${players[socket.id]?.name || socket.id} disconnected`);
    delete players[socket.id];
    socket.broadcast.emit("player-left", socket.id);
  });
});

http.listen(3000, () => {
  console.log("🌐 Server running on port 3000");
});
