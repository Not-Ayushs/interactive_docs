import { io } from "socket.io-client";
import { getApiBaseUrl } from "./api.js";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    const serverUrl = getApiBaseUrl();

    socket = io(serverUrl, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected successfully with ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinDocumentRoom = (docId) => {
  const s = getSocket();
  if (s && docId) {
    s.emit("join-document", { docId });
  }
};

export const leaveDocumentRoom = (docId) => {
  const s = getSocket();
  if (s && docId) {
    s.emit("leave-document", { docId });
  }
};

export const emitDocChange = (docId, content) => {
  const s = getSocket();
  if (s && docId) {
    s.emit("doc-change", { docId, content });
  }
};

export const emitCanvasChange = (docId, elements, camera) => {
  const s = getSocket();
  if (s && docId) {
    s.emit("canvas-change", { docId, elements, camera });
  }
};

export const emitCanvasCursor = (docId, x, y) => {
  const s = getSocket();
  if (s && docId) {
    s.emit("canvas-cursor", { docId, x, y });
  }
};
