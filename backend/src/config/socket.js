const jwt = require("jsonwebtoken");

let io;

/*
|--------------------------------------------------------------------------
| initializeSocket
|
| Sets up Socket.io with:
|  - JWT handshake authentication (rejects unauthenticated connections)
|  - Per-user private rooms  →  io.to(userId).emit(...)
|  - Role-based rooms        →  io.to("hr-room").emit(...)  for HR-only events
|--------------------------------------------------------------------------
*/

const initializeSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | JWT Handshake Middleware
  |
  | Client must pass the JWT in the handshake auth object:
  |   socket = io(SERVER_URL, { auth: { token: localStorage.getItem("token") } })
  |--------------------------------------------------------------------------
  */

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required: no token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = String(decoded.userId);
      socket.userRole = decoded.role;

      next();
    } catch (err) {
      return next(new Error("Authentication failed: invalid or expired token"));
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Connection Handler
  |--------------------------------------------------------------------------
  */

  io.on("connection", (socket) => {
    // Join private user room — enables io.to(userId).emit(...)
    socket.join(socket.userId);

    // HR users also join the shared HR room for broadcast events
    if (socket.userRole === "HR") {
      socket.join("hr-room");
    }

    console.log(
      `🔌 Socket connected: userId=${socket.userId} role=${socket.userRole} socketId=${socket.id}`
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: userId=${socket.userId} reason=${reason}`
      );
    });
  });

  return io;
};

/*
|--------------------------------------------------------------------------
| getIO
|
| Returns the initialized Socket.io instance.
| Throws if called before initializeSocket().
|--------------------------------------------------------------------------
*/

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized — call initializeSocket() first");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};