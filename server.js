const io = require("socket.io")(3000, {
  cors: { origin: "*" }
});

let players = {};

io.on("connection", (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // Create a new player entry with default position
  players[socket.id] = { x: 10, y: 10 };

  // Send existing player data to the new client
  socket.emit("init", players);

  // Notify everyone else a new player joined
  socket.broadcast.emit("player-joined", { id: socket.id, ...players[socket.id] });

  // Receive movement from player and broadcast to others
  socket.on("move", (data) => {
    console.log(`📦 Move received from ${socket.id}:`, data);
    players[socket.id] = data;
    socket.broadcast.emit("player-move", { id: socket.id, ...data });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit("player-left", socket.id);
  });
});
