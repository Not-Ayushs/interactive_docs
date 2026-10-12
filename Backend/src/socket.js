import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import Document from "./models/Document.js";

let ioInstance = null;

// Track active users per document room:
// docId -> Map of socketId -> { userId, name, email, color }
const roomUsers = new Map();

// Helper for generating distinct pastel avatar colors
const USER_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#EF4444", // red
  "#14B8A6", // teal
];

const getColorForUser = (userId) => {
  if (!userId) return USER_COLORS[0];
  const str = userId.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

// Debounce map for DB saving: docId -> timer
const saveDebounceTimers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(null, origin);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"]
    },
    pingTimeout: 60000,
  });

  ioInstance = io;

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        color: getColorForUser(user._id),
      };

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.user.name} (${socket.user.email}) - Socket: ${socket.id}`);

    // Join personal user room for targeted notifications (e.g. "document shared with you")
    socket.join(`user:${socket.user._id}`);

    // Track which doc rooms this socket is currently in
    const joinedDocs = new Set();

    // 1. JOIN DOCUMENT ROOM
    socket.on("join-document", async ({ docId }) => {
      if (!docId) return;

      socket.join(docId);
      joinedDocs.add(docId);

      if (!roomUsers.has(docId)) {
        roomUsers.set(docId, new Map());
      }

      const currentRoom = roomUsers.get(docId);
      currentRoom.set(socket.id, {
        socketId: socket.id,
        userId: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
        color: socket.user.color,
      });

      // Send active users list to everyone in room
      const activeList = Array.from(currentRoom.values());
      io.to(docId).emit("active-users", activeList);

      // Notify others in room
      socket.to(docId).emit("user-joined-doc", {
        user: socket.user,
        message: `${socket.user.name} joined the document`,
      });

      console.log(`[Socket] ${socket.user.name} joined doc ${docId}. Active users: ${activeList.length}`);
    });

    // 2. LEAVE DOCUMENT ROOM
    socket.on("leave-document", ({ docId }) => {
      if (!docId) return;

      socket.leave(docId);
      joinedDocs.delete(docId);

      if (roomUsers.has(docId)) {
        const currentRoom = roomUsers.get(docId);
        currentRoom.delete(socket.id);

        const activeList = Array.from(currentRoom.values());
        io.to(docId).emit("active-users", activeList);

        if (currentRoom.size === 0) {
          roomUsers.delete(docId);
        }
      }

      socket.to(docId).emit("user-left-doc", {
        user: socket.user,
        message: `${socket.user.name} left the document`,
      });
    });

    // 3. REAL-TIME DOC CONTENT CHANGE (Text Editor)
    socket.on("doc-change", ({ docId, content }) => {
      if (!docId) return;

      // Broadcast changes to other collaborators in real time
      socket.to(docId).emit("doc-changed", {
        content,
        updatedBy: socket.user,
        timestamp: Date.now(),
      });

      // Debounce saving to database (1.5s after last edit)
      if (saveDebounceTimers.has(docId)) {
        clearTimeout(saveDebounceTimers.get(docId));
      }

      const timer = setTimeout(async () => {
        try {
          await Document.findByIdAndUpdate(docId, { desc: content });
          saveDebounceTimers.delete(docId);
        } catch (err) {
          console.error(`Failed to auto-save doc ${docId}:`, err.message);
        }
      }, 1500);

      saveDebounceTimers.set(docId, timer);
    });

    // 4. REAL-TIME CANVAS CHANGE (Canvas Editor)
    socket.on("canvas-change", ({ docId, elements, camera }) => {
      if (!docId) return;

      // Broadcast to other collaborators
      socket.to(docId).emit("canvas-changed", {
        elements,
        camera,
        updatedBy: socket.user,
        timestamp: Date.now(),
      });

      // Debounce saving canvas to database (2s after last stroke)
      if (saveDebounceTimers.has(`canvas:${docId}`)) {
        clearTimeout(saveDebounceTimers.get(`canvas:${docId}`));
      }

      const timer = setTimeout(async () => {
        try {
          const canvasDataStr = JSON.stringify({ elements, camera });
          await Document.findByIdAndUpdate(docId, { canvasData: canvasDataStr });
          saveDebounceTimers.delete(`canvas:${docId}`);
        } catch (err) {
          console.error(`Failed to auto-save canvas ${docId}:`, err.message);
        }
      }, 2000);

      saveDebounceTimers.set(`canvas:${docId}`, timer);
    });

    // 5. REAL-TIME CANVAS CURSOR / POINTER
    socket.on("canvas-cursor", ({ docId, x, y }) => {
      if (!docId) return;
      socket.to(docId).emit("canvas-cursor-moved", {
        userId: socket.user._id,
        name: socket.user.name,
        color: socket.user.color,
        x,
        y,
      });
    });

    // 6. DISCONNECT
    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.user.name}`);

      // Clean up all rooms the user was in
      joinedDocs.forEach((docId) => {
        if (roomUsers.has(docId)) {
          const currentRoom = roomUsers.get(docId);
          currentRoom.delete(socket.id);

          const activeList = Array.from(currentRoom.values());
          io.to(docId).emit("active-users", activeList);

          if (currentRoom.size === 0) {
            roomUsers.delete(docId);
          } else {
            socket.to(docId).emit("user-left-doc", {
              user: socket.user,
              message: `${socket.user.name} disconnected`,
            });
          }
        }
      });
    });
  });

  return io;
};

export const getIO = () => ioInstance;
